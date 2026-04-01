import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import { IPacRepository } from '../../domain/pac.repository';
import { PacResumenEntity } from '../../domain/pac.entity';

@Injectable()
export class PacPrismaRepository implements IPacRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Replica la lógica principal de Informe_pac (controller) +
   * Presupuesto::get_presupuesto_dia / get_presupuesto_mes
   * Informe::get_total_dias / get_dias_actual / Informe_inventario / get_calificacion_sede('general')
   * e Informe::get_data_nps_interno_sedes($bod) para el NPS interno general.
   */
  async obtenerResumen(): Promise<PacResumenEntity> {
    // 1) Presupuesto a hoy (to_dia) usando get_presupuesto_dia
    const centrosCostos = '4,40,33,45,3,16,17,13,70,11,29,80,31,46,28,60,15';
    const presupuestoDiaSql = Prisma.sql`
      SELECT total = SUM(valor * -1)
      FROM movimiento
      WHERE (cuenta LIKE '4135%' OR cuenta LIKE '4175%' OR cuenta LIKE '530535%')
        AND centro IN (${Prisma.raw(centrosCostos)})
        AND fec BETWEEN CONVERT(date, DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0))
                AND CONVERT(date, GETDATE())
        AND tipo NOT IN (
          'SIR','IT','BC','SIK','IK','SIQ','SIL','IL','SIT','SIW','WI','DIT','DIK','DIW','DIL'
        )
    `;
    const [presDiaRow] = await this.prisma.$queryRaw<
      { total: number | null }[]
    >(presupuestoDiaSql);
    const toDia = presDiaRow?.total ?? 0;

    // 2) Presupuesto del mes (to_t) usando get_presupuesto_mes sobre sede CODIESEL
    const primerDiaSql = Prisma.sql`
      SELECT CONVERT(DATE, DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0), 23) AS fecha
    `;
    const ultimoDiaSql = Prisma.sql`
      SELECT CONVERT(
        DATE,
        DATEADD(
          d,
          -1,
          DATEADD(m, DATEDIFF(m, 0, GETDATE()) + 1, 0)
        ),
        23
      ) AS fecha
    `;
    const [primerDiaRow] = await this.prisma.$queryRaw<{ fecha: Date }[]>(
      primerDiaSql,
    );
    const [ultimoDiaRow] = await this.prisma.$queryRaw<{ fecha: Date }[]>(
      ultimoDiaSql,
    );
    const fechaIniMes = primerDiaRow?.fecha;
    const fechaFinMes = ultimoDiaRow?.fecha;

    const presupuestoMesSql = Prisma.sql`
      SELECT presupuesto
      FROM presupuesto
      WHERE CONVERT(DATE, fecha_ini) = CONVERT(DATE, ${fechaIniMes})
        AND CONVERT(DATE, fecha_fin) = CONVERT(DATE, ${fechaFinMes})
        AND sede = 'CODIESEL'
    `;
    const presMesRows = await this.prisma.$queryRaw<{ presupuesto: number }[]>(
      presupuestoMesSql,
    );
    const toMes = presMesRows?.[0]?.presupuesto ?? 0;

    // 3) Días del mes y día actual (get_total_dias / get_dias_actual)
    const [totalDiasRow] = await this.prisma.$queryRaw<{ ultimo_dia: number }[]>`
      SELECT DAY(DATEADD(s,-1,DATEADD(mm, DATEDIFF(m,0,GETDATE())+1,0))) AS ultimo_dia
    `;
    const [diaActualRow] = await this.prisma.$queryRaw<{ dia: number }[]>`
      SELECT DAY(GETDATE()) AS dia
    `;
    const totalDiasMes = totalDiasRow?.ultimo_dia ?? 1;
    const diaActual = diaActualRow?.dia ?? 1;

    const toObjetivo = totalDiasMes > 0 ? (toMes / totalDiasMes) * diaActual : 0;

    // 4) Porcentajes (mismas fórmulas del legacy)
    const porcenHoy =
      toObjetivo > 0 ? (toDia / toObjetivo) * 100 : 0; // porcentaje_a_hoy
    let porcenHoyRes = 100 - porcenHoy;
    if (porcenHoyRes < 0) porcenHoyRes = 0;

    const porcenMes = toMes > 0 ? (toDia * 100) / toMes : 0; // porcentaje
    let porcenMesRes = 100 - porcenMes;
    if (porcenMesRes < 0) porcenMesRes = 0;

    // 5) Inventario (Informe_inventario)
    const inventarioSql = Prisma.sql`
      SELECT
        Promedio,
        stock,
        r.codigo,
        calificacion_abc
      FROM referencias r
      INNER JOIN v_referencias_cos v_r ON r.codigo = v_r.codigo
      INNER JOIN v_referencias_sto_hoy vr ON vr.codigo = r.codigo
      WHERE bodega IN (1,3,4,6,7,8,13,23,25,94,95,96,97,98)
        AND r.clase IN ('RES','REP')
        AND r.contable IN (100,105,110)
    `;
    const inventarioRows = await this.prisma.$queryRaw<
      { Promedio: number; stock: number; calificacion_abc: string | null }[]
    >(inventarioSql);

    let valTotalInventario = 0;
    for (const row of inventarioRows) {
      valTotalInventario += (row.Promedio ?? 0) * (row.stock ?? 0);
    }

    // 6) Calificación PAC / NPS general (NPS_sedes, sede = 'general')
    const calificacionPacSql = Prisma.sql`
      SELECT TOP 1 Calificacion, Enc_0_a_6, Enc_7_a_8, Enc_9_a_10
      FROM NPS_sedes
      WHERE CONVERT(DATE, Fecha) = CONVERT(DATE, GETDATE())
        AND Sede = 'general'
      ORDER BY Fecha DESC
    `;
    const calRows = await this.prisma.$queryRaw<
      {
        Calificacion: number;
        Enc_0_a_6: number;
        Enc_7_a_8: number;
        Enc_9_a_10: number;
      }[]
    >(calificacionPacSql);

    let calificacionPac = 0;
    let enc06 = 0;
    let enc78 = 0;
    let enc910 = 0;
    let porcen06 = 0;
    let porcen78 = 0;
    let porcen910 = 0;

    if (calRows && calRows.length > 0) {
      const row = calRows[0];
      calificacionPac = row.Calificacion ?? 0;
      enc06 = row.Enc_0_a_6 ?? 0;
      enc78 = row.Enc_7_a_8 ?? 0;
      enc910 = row.Enc_9_a_10 ?? 0;
      const totalEncuestas = enc06 + enc78 + enc910;
      if (totalEncuestas > 0) {
        porcen06 = (enc06 * 100) / totalEncuestas;
        porcen78 = (enc78 * 100) / totalEncuestas;
        porcen910 = (enc910 * 100) / totalEncuestas;
      }
    }

    // 7) NPS interno general (Informe::get_data_nps_interno_sedes con bod = "1,9,11,21,7,6,19,8,14,16,22")
    const bodInterno = '1,9,11,21,7,6,19,8,14,16,22';
    const npsInternoSql = Prisma.sql`
      SELECT
        SUM(CASE WHEN pes.pregunta1 BETWEEN 0 AND 6 THEN 1 ELSE 0 END) AS enc0a6,
        SUM(CASE WHEN pes.pregunta1 BETWEEN 7 AND 8 THEN 1 ELSE 0 END) AS enc7a8,
        SUM(CASE WHEN pes.pregunta1 BETWEEN 9 AND 10 THEN 1 ELSE 0 END) AS enc9a10
      FROM postv_encuesta_satisfaccion_qr pes
      WHERE pes.bod IN (${Prisma.raw(bodInterno)})
    `;
    const [npsIntRow] = await this.prisma.$queryRaw<
      { enc0a6: number | null; enc7a8: number | null; enc9a10: number | null }[]
    >(npsInternoSql);

    let npsCompany = 0;
    if (npsIntRow) {
      const enc0a6Int = npsIntRow.enc0a6 ?? 0;
      const enc7a8Int = npsIntRow.enc7a8 ?? 0;
      const enc9a10Int = npsIntRow.enc9a10 ?? 0;
      const totalEncInt = enc0a6Int + enc7a8Int + enc9a10Int;
      if (totalEncInt > 0) {
        npsCompany = ((enc9a10Int - enc0a6Int) / totalEncInt) * 100;
      }
    }

    return new PacResumenEntity({
      calificacionPac,
      npsCompany,
      enc06,
      enc78,
      enc910,
      porcen06,
      porcen78,
      porcen910,
      toDia,
      toMes,
      porcenHoy,
      porcenHoyRes,
      porcenMes,
      porcenMesRes,
      valTotalInventario,
    });
  }
}

