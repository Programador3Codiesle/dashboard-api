import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CODIESEL_EMPRESA_ID } from '../../../../../../core/config/empresa-sesion';
import {
  listarIdsBodegaEmpresa,
  resolverBodegasInforme,
} from '../../../../../../core/infra/prisma/bodegas-empresa.query';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import { IPacRepository } from '../../domain/pac.repository';
import { PAC_NPS_COMPANY, PacResumenEntity } from '../../domain/pac.entity';
import {
  SEDE_PRESUPUESTO_CODINOVA,
  sedesPresupuestoPac,
} from '../../domain/sede-presupuesto-pac';

/** Centros PHP `get_presupuesto_dia` (Informe_pac). Solo Codiesel. */
const CENTROS_PRESUPUESTO_CODIESEL = [
  4, 40, 33, 45, 3, 16, 17, 13, 70, 11, 29, 80, 31, 46, 28, 60, 15,
];

const BODEGAS_INVENTARIO_PHP = [
  1, 3, 4, 6, 7, 8, 13, 23, 25, 94, 95, 96, 97, 98,
];

const BODEGAS_NPS_INTERNO_PHP = [1, 9, 11, 21, 7, 6, 19, 8, 14, 16, 22];

@Injectable()
export class PacPrismaRepository implements IPacRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Replica Informe_pac: presupuesto, inventario (Informe::Informe_inventario),
   * NPS_sedes general (solo Codiesel; la tabla no tiene id_empresa),
   * NPS interno (get_data_nps_interno_sedes) y objetivo `$NPSGNERAL`.
   */
  async obtenerResumen(empresaId: number): Promise<PacResumenEntity> {
    const bodegasEmpresa = await listarIdsBodegaEmpresa(this.prisma, empresaId);

    const toDia = await this.sumarPresupuestoDia(empresaId, bodegasEmpresa);
    const toMes = await this.presupuestoMes(empresaId);

    const [totalDiasRow] = await this.prisma.$queryRaw<
      { ultimo_dia: number }[]
    >`
      SELECT DAY(DATEADD(s,-1,DATEADD(mm, DATEDIFF(m,0,GETDATE())+1,0))) AS ultimo_dia
    `;
    const [diaActualRow] = await this.prisma.$queryRaw<{ dia: number }[]>`
      SELECT DAY(GETDATE()) AS dia
    `;
    const totalDiasMes = totalDiasRow?.ultimo_dia ?? 1;
    const diaActual = diaActualRow?.dia ?? 1;

    const toObjetivo =
      totalDiasMes > 0 ? (toMes / totalDiasMes) * diaActual : 0;

    const porcenHoy = toObjetivo > 0 ? (toDia / toObjetivo) * 100 : 0;
    let porcenHoyRes = 100 - porcenHoy;
    if (porcenHoyRes < 0) porcenHoyRes = 0;

    const porcenMes = toMes > 0 ? (toDia * 100) / toMes : 0;
    let porcenMesRes = 100 - porcenMes;
    if (porcenMesRes < 0) porcenMesRes = 0;

    const bodegasInv = resolverBodegasInforme(
      empresaId,
      BODEGAS_INVENTARIO_PHP,
      bodegasEmpresa,
    );
    const valTotalInventario = await this.sumarInventario(bodegasInv);

    const npsGeneral =
      empresaId === CODIESEL_EMPRESA_ID
        ? await this.npsSedesGeneral()
        : {
            calificacionPac: 0,
            enc06: 0,
            enc78: 0,
            enc910: 0,
            porcen06: 0,
            porcen78: 0,
            porcen910: 0,
          };

    const bodegasNpsInt = resolverBodegasInforme(
      empresaId,
      BODEGAS_NPS_INTERNO_PHP,
      bodegasEmpresa,
    );
    const npsInterno = await this.npsInterno(bodegasNpsInt);

    return new PacResumenEntity({
      calificacionPac: npsGeneral.calificacionPac,
      npsCompany: PAC_NPS_COMPANY,
      enc06: npsGeneral.enc06,
      enc78: npsGeneral.enc78,
      enc910: npsGeneral.enc910,
      porcen06: npsGeneral.porcen06,
      porcen78: npsGeneral.porcen78,
      porcen910: npsGeneral.porcen910,
      npsInterno: npsInterno.npsInterno,
      encInterno06: npsInterno.encInterno06,
      encInterno78: npsInterno.encInterno78,
      encInterno910: npsInterno.encInterno910,
      porcenInterno06: npsInterno.porcenInterno06,
      porcenInterno78: npsInterno.porcenInterno78,
      porcenInterno910: npsInterno.porcenInterno910,
      toDia,
      toMes,
      porcenHoy,
      porcenHoyRes,
      porcenMes,
      porcenMesRes,
      valTotalInventario,
    });
  }

  private async sumarPresupuestoDia(
    empresaId: number,
    bodegasEmpresa: number[],
  ): Promise<number> {
    const centros =
      empresaId === CODIESEL_EMPRESA_ID
        ? CENTROS_PRESUPUESTO_CODIESEL
        : bodegasEmpresa;
    if (centros.length === 0) return 0;

    const [presDiaRow] = await this.prisma.$queryRaw<
      { total: number | null }[]
    >(
      Prisma.sql`
        SELECT total = SUM(valor * -1)
        FROM movimiento
        WHERE (cuenta LIKE '4135%' OR cuenta LIKE '4175%' OR cuenta LIKE '530535%')
          AND centro IN (${Prisma.join(centros)})
          AND fec BETWEEN CONVERT(date, DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0))
                  AND CONVERT(date, GETDATE())
          AND tipo NOT IN (
            'SIR','IT','BC','SIK','IK','SIQ','SIL','IL','SIT','SIW','WI','DIT','DIK','DIW','DIL'
          )
      `,
    );
    return presDiaRow?.total ?? 0;
  }

  private async presupuestoMes(empresaId: number): Promise<number> {
    const sedes = sedesPresupuestoPac(empresaId);
    if (sedes.length === 0) return 0;

    const [primerDiaRow] = await this.prisma.$queryRaw<{ fecha: Date }[]>`
      SELECT CONVERT(DATE, DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0), 23) AS fecha
    `;
    const [ultimoDiaRow] = await this.prisma.$queryRaw<{ fecha: Date }[]>`
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
    const fechaIniMes = primerDiaRow?.fecha;
    const fechaFinMes = ultimoDiaRow?.fecha;

    const presMesRows = await this.prisma.$queryRaw<{ presupuesto: number }[]>(
      Prisma.sql`
        SELECT TOP 1 presupuesto
        FROM presupuesto
        WHERE CONVERT(DATE, fecha_ini) = CONVERT(DATE, ${fechaIniMes})
          AND CONVERT(DATE, fecha_fin) = CONVERT(DATE, ${fechaFinMes})
          AND UPPER(LTRIM(RTRIM(sede))) IN (${Prisma.join(sedes)})
        ORDER BY CASE
          WHEN UPPER(LTRIM(RTRIM(sede))) = ${SEDE_PRESUPUESTO_CODINOVA} THEN 0
          ELSE 1
        END
      `,
    );
    return presMesRows?.[0]?.presupuesto ?? 0;
  }

  private async sumarInventario(bodegasInv: number[]): Promise<number> {
    if (bodegasInv.length === 0) return 0;

    const inventarioRows = await this.prisma.$queryRaw<
      { Promedio: number; stock: number; calificacion_abc: string | null }[]
    >(Prisma.sql`
      SELECT
        Promedio,
        stock,
        r.codigo,
        calificacion_abc
      FROM referencias r
      INNER JOIN v_referencias_cos v_r ON r.codigo = v_r.codigo
      INNER JOIN v_referencias_sto_hoy vr ON vr.codigo = r.codigo
      WHERE bodega IN (${Prisma.join(bodegasInv)})
        AND stock != 0
        AND v_r.ano = YEAR(CONVERT(DATE, GETDATE()))
        AND v_r.mes = MONTH(CONVERT(DATE, GETDATE()))
        AND r.conversion != -1
        AND r.contable IN (100, 105, 110)
    `);

    let valTotalInventario = 0;
    for (const row of inventarioRows) {
      valTotalInventario += (row.Promedio ?? 0) * (row.stock ?? 0);
    }
    return valTotalInventario;
  }

  private async npsSedesGeneral(): Promise<{
    calificacionPac: number;
    enc06: number;
    enc78: number;
    enc910: number;
    porcen06: number;
    porcen78: number;
    porcen910: number;
  }> {
    const calRows = await this.prisma.$queryRaw<
      {
        Calificacion: number;
        Enc_0_a_6: number;
        Enc_7_a_8: number;
        Enc_9_a_10: number;
      }[]
    >`
      SELECT TOP 1 Calificacion, Enc_0_a_6, Enc_7_a_8, Enc_9_a_10
      FROM NPS_sedes
      WHERE CONVERT(DATE, Fecha) = CONVERT(DATE, GETDATE())
        AND Sede = 'general'
      ORDER BY Fecha DESC
    `;

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

    return {
      calificacionPac,
      enc06,
      enc78,
      enc910,
      porcen06,
      porcen78,
      porcen910,
    };
  }

  private async npsInterno(bodegas: number[]): Promise<{
    npsInterno: number;
    encInterno06: number;
    encInterno78: number;
    encInterno910: number;
    porcenInterno06: number;
    porcenInterno78: number;
    porcenInterno910: number;
  }> {
    const vacio = {
      npsInterno: 0,
      encInterno06: 0,
      encInterno78: 0,
      encInterno910: 0,
      porcenInterno06: 0,
      porcenInterno78: 0,
      porcenInterno910: 0,
    };
    if (bodegas.length === 0) return vacio;

    const npsInternoRows = await this.prisma.$queryRaw<
      {
        enc0a6: number | null;
        enc7a8: number | null;
        enc9a10: number | null;
      }[]
    >(Prisma.sql`
      SELECT
        t.nombres AS tecnico,
        pes.bod,
        COUNT(CASE WHEN pes.pregunta1 BETWEEN 0 AND 6 THEN 'enc0a6' END) AS enc0a6,
        COUNT(CASE WHEN pes.pregunta1 BETWEEN 7 AND 8 THEN 'enc7A8' END) AS enc7a8,
        COUNT(CASE WHEN pes.pregunta1 BETWEEN 9 AND 10 THEN 'enc9A10' END) AS enc9a10
      FROM postv_encuesta_satisfaccion_qr pes
      INNER JOIN referencias_imp r ON pes.placa = r.placa
      INNER JOIN v_ultima_entrada_taller_datos uet ON r.codigo = uet.uetd_serie
      INNER JOIN tall_encabeza_orden te ON uet.uetd_numero = te.numero
      INNER JOIN terceros t ON te.vendedor = t.nit
      WHERE MONTH(CONVERT(DATE, pes.fecha)) =
            MONTH(DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) - 0, 0))
        AND YEAR(CONVERT(DATE, pes.fecha)) = YEAR(GETDATE())
        AND pes.bod IN (${Prisma.join(bodegas)})
      GROUP BY t.nombres, pes.bod
    `);

    let encInterno06 = 0;
    let encInterno78 = 0;
    let encInterno910 = 0;
    for (const row of npsInternoRows) {
      encInterno06 += row.enc0a6 ?? 0;
      encInterno78 += row.enc7a8 ?? 0;
      encInterno910 += row.enc9a10 ?? 0;
    }
    const totalEncInt = encInterno06 + encInterno78 + encInterno910;
    if (encInterno06 === 0 && encInterno78 === 0 && encInterno910 === 0) {
      return vacio;
    }

    return {
      npsInterno: ((encInterno910 - encInterno06) / totalEncInt) * 100,
      encInterno06,
      encInterno78,
      encInterno910,
      porcenInterno06: (encInterno06 * 100) / totalEncInt,
      porcenInterno78: (encInterno78 * 100) / totalEncInt,
      porcenInterno910: (encInterno910 * 100) / totalEncInt,
    };
  }
}
