import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import { IDashboardCommonRepository } from '../../domain/dashboard-common.repository';
import {
  DashboardCommonRow,
  SedesUserRow,
  VentasBodRow,
  VentasBodGrafRow,
  VentasBodDetalleRow,
  NpsSedesMesRow,
  NpsBodGrafRow,
  NpsCalificacionRow,
  GrafSedesRow,
  InventarioRow,
  PostvPresupuestoPosventaRow,
} from '../../domain/dashboard.repository';
import { parseIds } from './shared.utils';

/**
 * Repositorio Prisma para operaciones comunes del dashboard,
 * reutilizadas por varios perfiles (admin, gerencia, técnicos, etc.).
 */
@Injectable()
export class DashboardCommonPrismaRepository
  implements IDashboardCommonRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async getFecha(): Promise<DashboardCommonRow | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT CONVERT(VARCHAR(10), GETDATE(), 120) AS fecha_actual
    `;
    const r = rows[0];
    return r ? { fecha_actual: String(r.fecha_actual ?? '') } : null;
  }

  async diasFestivos(fecha: string): Promise<number> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT 1 AS n FROM y_calendario
      WHERE CONVERT(DATE, fecha) = CONVERT(DATE, ${fecha}) AND festivo = 1
    `;
    return rows && rows.length > 0 ? 1 : 0;
  }

  async getMesAnoActual(): Promise<{ mes: number; ano: number } | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT MONTH(GETDATE()) AS mes, YEAR(GETDATE()) AS ano
    `;
    const r = rows[0];
    return r ? { mes: Number(r.mes), ano: Number(r.ano) } : null;
  }

  async getSedesUser(nitUsuario: number): Promise<SedesUserRow[]> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT usede.idsede, t.nombres, b.descripcion, CONVERT(VARCHAR, usede.idsede) AS idsede_v
      FROM sw_usuariosede usede
      INNER JOIN w_sist_usuarios su ON usede.idusuario = su.id_usuario
      INNER JOIN terceros t ON t.nit_real = su.nit_usuario
      INNER JOIN bodegas b ON usede.idsede = b.bodega
      WHERE t.nit_real = ${nitUsuario}
    `;
    return (rows ?? []).map((r) => ({
      idsede: Number(r.idsede),
      idsede_v: String(r.idsede_v ?? r.idsede),
      nombres: r.nombres,
      descripcion: r.descripcion,
    }));
  }

  async getVentasBod(
    sedesIds: string,
    mes: number,
    ano: number,
  ): Promise<VentasBodRow | null> {
    const ids = parseIds(sedesIds);
    if (ids.length === 0) return null;
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        rptos = SUM(venta_rptos),
        MO = SUM(Venta_mano_obra),
        horas_facturadas = SUM(horas),
        TOT = SUM(venta_TOT)
      FROM v_posv_Informe_tecnicos
      WHERE Año = ${ano} AND Mes = ${mes}
        AND (venta_rptos <> 0 OR Venta_mano_obra <> 0 OR venta_TOT <> 0)
        AND sede IN (${Prisma.join(ids)})
      GROUP BY Año, Mes
    `;
    const r = rows[0];
    if (!r) return null;
    return {
      rptos: Number(r.rptos ?? 0),
      MO: Number(r.MO ?? 0),
      TOT: Number(r.TOT ?? 0),
      horas_facturadas: Number(r.horas_facturadas ?? 0),
    };
  }

  async getVentasBodDetalle(
    sedesIds: string,
    mes: number,
    ano: number,
  ): Promise<VentasBodDetalleRow[]> {
    const ids = parseIds(sedesIds);
    if (ids.length === 0) return [];
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT Año, Mes, operario, tecnico, numero_orden, cliente,
        rptos = SUM(venta_rptos), MO = SUM(Venta_mano_obra), horas_facturadas = SUM(horas)
      FROM v_posv_Informe_tecnicos
      WHERE Año = ${ano} AND Mes = ${mes}
        AND (venta_rptos <> 0 OR Venta_mano_obra <> 0)
        AND sede IN (${Prisma.join(ids)})
      GROUP BY Año, Mes, operario, tecnico, numero_orden, cliente
    `;
    return (rows ?? []).map((r) => ({
      operario: String(r.operario ?? ''),
      tecnico: String(r.tecnico ?? ''),
      numero_orden: Number(r.numero_orden),
      cliente: String(r.cliente ?? ''),
      rptos: Number(r.rptos ?? 0),
      MO: Number(r.MO ?? 0),
      horas_facturadas: Number(r.horas_facturadas ?? 0),
    }));
  }

  async getVentasBodGraf(
    idsede: number,
    mes: number,
    ano: number,
  ): Promise<VentasBodGrafRow | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        rptos = SUM(venta_rptos),
        MO = SUM(Venta_mano_obra),
        horas_facturadas = SUM(horas),
        TOT = SUM(venta_TOT),
        mes_nom = CASE WHEN Mes = 1 THEN N'Enero'
          WHEN Mes = 2 THEN N'Febrero' WHEN Mes = 3 THEN N'Marzo'
          WHEN Mes = 4 THEN N'Abril' WHEN Mes = 5 THEN N'Mayo'
          WHEN Mes = 6 THEN N'Junio' WHEN Mes = 7 THEN N'Julio'
          WHEN Mes = 8 THEN N'Agosto' WHEN Mes = 9 THEN N'Septiembre'
          WHEN Mes = 10 THEN N'Octubre' WHEN Mes = 11 THEN N'Noviembre'
          ELSE N'Diciembre' END
      FROM v_posv_Informe_tecnicos
      WHERE Año = ${ano} AND Mes = ${mes}
        AND (venta_rptos <> 0 OR Venta_mano_obra <> 0 OR venta_TOT <> 0)
        AND sede = ${idsede}
      GROUP BY Año, Mes
    `;
    const r = rows?.[0];
    if (!r) return null;
    return {
      rptos: Number(r.rptos ?? 0),
      MO: Number(r.MO ?? 0),
      TOT: Number(r.TOT ?? 0),
      horas_facturadas: Number(r.horas_facturadas ?? 0),
      mes_nom: String(r.mes_nom ?? ''),
    };
  }

  private static readonly MESES_NOM = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  /**
   * NPS Interno por bodega y mes (gráfica). Alineado con legacy Informe::get_nps_int_bod_graf:
   * tabla postv_encuesta_satisfaccion_qr, join por numero_orden.
   */
  async getNpsIntBodGraf(
    idsede: number,
    mes: number,
    ano: number,
  ): Promise<NpsBodGrafRow | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        enc0a6 = COUNT(CASE WHEN pes.pregunta1 BETWEEN 0 AND 6 THEN 1 END),
        enc7a8 = COUNT(CASE WHEN pes.pregunta1 BETWEEN 7 AND 8 THEN 1 END),
        enc9a10 = COUNT(CASE WHEN pes.pregunta1 BETWEEN 9 AND 10 THEN 1 END)
      FROM postv_encuesta_satisfaccion_qr pes
      INNER JOIN tall_encabeza_orden teo ON teo.numero = pes.numero_orden
      INNER JOIN terceros t ON t.nit_real = teo.vendedor
      WHERE MONTH(CONVERT(DATE, teo.fecha_hora_entrega_real)) = ${mes}
        AND YEAR(CONVERT(DATE, teo.fecha_hora_entrega_real)) = ${ano}
        AND teo.bodega = ${idsede}
    `;
    const r = rows?.[0];
    const mesNom =
      mes >= 1 && mes <= 12
        ? DashboardCommonPrismaRepository.MESES_NOM[mes]
        : '';
    return {
      enc0a6: Number(r?.enc0a6 ?? 0),
      enc7a8: Number(r?.enc7a8 ?? 0),
      enc9a10: Number(r?.enc9a10 ?? 0),
      mes_nom: mesNom,
    };
  }

  /**
   * NPS GM (Colmotores) por nombre sede y mes.
   * Legacy: Informe::get_nps_by_bod_gm_graf — tabla nps_tec, calificacion (0-6, 7-8, 9-10),
   * sede = 'giron'|'barranca'|'rosita'|'bocono', GROUP BY nombres,fecha_enc (PHP suma las filas).
   * Aquí se obtiene el mismo resultado con un único agregado (sin GROUP BY).
   */
  async getNpsByBodGmGraf(
    sedeName: string,
    mes: number,
    ano: number,
  ): Promise<NpsBodGrafRow | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        enc0a6 = COUNT(CASE WHEN calificacion BETWEEN 0 AND 6 THEN 1 END),
        enc7a8 = COUNT(CASE WHEN calificacion BETWEEN 7 AND 8 THEN 1 END),
        enc9a10 = COUNT(CASE WHEN calificacion BETWEEN 9 AND 10 THEN 1 END)
      FROM nps_tec
      WHERE MONTH(CONVERT(DATE, fecha_enc)) = ${mes}
        AND YEAR(CONVERT(DATE, fecha_enc)) = ${ano}
        AND sede = ${sedeName}
    `;
    const r = rows?.[0];
    const mesNom =
      mes >= 1 && mes <= 12
        ? DashboardCommonPrismaRepository.MESES_NOM[mes]
        : '';
    return {
      enc0a6: Number(r?.enc0a6 ?? 0),
      enc7a8: Number(r?.enc7a8 ?? 0),
      enc9a10: Number(r?.enc9a10 ?? 0),
      mes_nom: mesNom,
    };
  }

  /**
   * NPS Interno mes actual por sedes (resumen). Alineado con legacy Informe::get_data_nps_interno_sedes_mes:
   * tabla posv_encuesta_satisfaccion, join por n_orden.
   */
  async getDataNpsInternoSedesMes(
    sedesIds: string,
  ): Promise<NpsSedesMesRow[]> {
    const ids = parseIds(sedesIds);
    if (ids.length === 0) return [];
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT t.nombres,
        COUNT(CASE WHEN pes.pregunta1 BETWEEN 0 AND 6 THEN 1 END) AS enc0a6,
        COUNT(CASE WHEN pes.pregunta1 BETWEEN 7 AND 8 THEN 1 END) AS enc7a8,
        COUNT(CASE WHEN pes.pregunta1 BETWEEN 9 AND 10 THEN 1 END) AS enc9a10
      FROM posv_encuesta_satisfaccion pes
      INNER JOIN tall_encabeza_orden teo ON teo.numero = pes.n_orden
      INNER JOIN terceros t ON t.nit_real = teo.vendedor
      WHERE CONVERT(DATE, teo.fecha_hora_entrega_real) BETWEEN CONVERT(DATE, DATEADD(mm, DATEDIFF(mm, 0, GETDATE()), 0))
        AND CONVERT(DATE, DATEADD(ms, -3, DATEADD(mm, 0, DATEADD(mm, DATEDIFF(mm, 0, GETDATE()) + 1, 0))))
        AND teo.bodega IN (${Prisma.join(ids)})
      GROUP BY t.nombres
    `;
    return (rows ?? []).map((r) => ({
      enc0a6: Number(r.enc0a6 ?? 0),
      enc7a8: Number(r.enc7a8 ?? 0),
      enc9a10: Number(r.enc9a10 ?? 0),
    }));
  }

  async getCalificacionSede(sede: string): Promise<NpsCalificacionRow[]> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT DISTINCT *
      FROM NPS_sedes
      WHERE CONVERT(DATE, Fecha) = CONVERT(DATE, GETDATE())
        AND Sede = ${sede}
    `;
    return (rows ?? []).map((r) => ({
      Enc_0_a_6: Number(r.Enc_0_a_6 ?? 0),
      Enc_7_a_8: Number(r.Enc_7_a_8 ?? 0),
      Enc_9_a_10: Number(r.Enc_9_a_10 ?? 0),
    }));
  }

  async getGrafSedes(): Promise<GrafSedesRow[]> {
    // Alineado con legacy Informe::Informe_presupuesto_by_sedes.
    // En el legacy es una consulta directa con UNION (no una vista),
    // por eso aquí se replica el SQL en lugar de usar v_informe_presupuesto_by_sedes.
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT total = SUM(valor * -1), fecha = CONVERT(DATE, GETDATE()), sede = 'giron'
      FROM movimiento
      WHERE (cuenta LIKE '4135%' OR cuenta LIKE '4175%' OR cuenta LIKE '530535%')
        AND centro IN (4, 40, 33, 45, 3)
        AND fec BETWEEN CONVERT(DATE, DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0))
          AND CONVERT(DATE, GETDATE())
        AND tipo NOT IN ('SIR', 'IT', 'BC', 'SIK', 'IK', 'SIQ', 'SIL', 'IL', 'SIT', 'SIW', 'WI', 'DIT', 'DIK', 'DIW', 'DIL')

      UNION

      SELECT total = SUM(valor * -1), fecha = CONVERT(DATE, GETDATE()), sede = 'rosita'
      FROM movimiento
      WHERE (cuenta LIKE '4135%' OR cuenta LIKE '4175%' OR cuenta LIKE '530535%')
        AND centro IN (16, 17)
        AND fec BETWEEN CONVERT(DATE, DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0))
          AND CONVERT(DATE, GETDATE())
        AND tipo NOT IN ('SIR', 'IT', 'BC', 'SIK', 'IK', 'SIQ', 'SIL', 'IL', 'SIT', 'SIW', 'WI', 'DIT', 'DIK', 'DIW', 'DIL')

      UNION

      SELECT total = SUM(valor * -1), fecha = CONVERT(DATE, GETDATE()), sede = 'barranca'
      FROM movimiento
      WHERE (cuenta LIKE '4135%' OR cuenta LIKE '4175%' OR cuenta LIKE '530535%')
        AND centro IN (13, 70, 11)
        AND fec BETWEEN CONVERT(DATE, DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0))
          AND CONVERT(DATE, GETDATE())
        AND tipo NOT IN ('SIR', 'IT', 'BC', 'SIK', 'IK', 'SIQ', 'SIL', 'IL', 'SIT', 'SIW', 'WI', 'DIT', 'DIK', 'DIW', 'DIL')

      UNION

      SELECT total = SUM(valor * -1), fecha = CONVERT(DATE, GETDATE()), sede = 'bocono'
      FROM movimiento
      WHERE (cuenta LIKE '4135%' OR cuenta LIKE '4175%' OR cuenta LIKE '530535%')
        AND centro IN (29, 80, 31, 46, 28)
        AND fec BETWEEN CONVERT(DATE, DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0))
          AND CONVERT(DATE, GETDATE())
        AND tipo NOT IN ('SIR', 'IT', 'BC', 'SIK', 'IK', 'SIQ', 'SIL', 'IL', 'SIT', 'SIW', 'WI', 'DIT', 'DIK', 'DIW', 'DIL')

      UNION

      SELECT total = SUM(valor * -1), fecha = CONVERT(DATE, GETDATE()), sede = 'solochevrolet'
      FROM movimiento
      WHERE (cuenta LIKE '4135%' OR cuenta LIKE '4175%' OR cuenta LIKE '530535%')
        AND centro IN (60)
        AND fec BETWEEN CONVERT(DATE, DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0))
          AND CONVERT(DATE, GETDATE())
        AND tipo NOT IN ('SIR', 'IT', 'BC', 'SIK', 'IK', 'SIQ', 'SIL', 'IL', 'SIT', 'SIW', 'WI', 'DIT', 'DIK', 'DIW', 'DIL')

      UNION

      SELECT total = SUM(valor * -1), fecha = CONVERT(DATE, GETDATE()), sede = 'chevropartes'
      FROM movimiento
      WHERE (cuenta LIKE '4135%' OR cuenta LIKE '4175%' OR cuenta LIKE '530535%')
        AND centro IN (15)
        AND fec BETWEEN CONVERT(DATE, DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0))
          AND CONVERT(DATE, GETDATE())
        AND tipo NOT IN ('SIR', 'IT', 'BC', 'SIK', 'IK', 'SIQ', 'SIL', 'IL', 'SIT', 'SIW', 'WI', 'DIT', 'DIK', 'DIW', 'DIL')
    `;
    return (rows ?? []).map((r) => ({
      total: Number(r.total ?? 0),
      sede: String(r.sede ?? ''),
    }));
  }

  async getPresupuestoMesSedesNew(
    idsede: string,
  ): Promise<{ presupuesto: number } | null> {
    const ids = parseIds(idsede);
    if (ids.length === 0) return null;
    // Alineado con legacy Presupuesto::get_presupuesto_mes_sedes_new,
    // que suma los campos de `postv_presupuesto_posventa` para las sedes y mes/año actuales.
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT presupuesto = SUM(
        rptos_mto_preventivo +
        rptos_mto_correctivo +
        rptos_garantia +
        rptos_colision +
        mo_mto_preventivo +
        mo_mto_correctivo +
        mo_garantia +
        mo_colision +
        tot_mto_preventivo +
        tot_mto_correctivo +
        tot_garantia +
        tot_colision +
        ISNULL(mostrador, 0)
      )
      FROM postv_presupuesto_posventa
      WHERE bodega IN (${Prisma.join(ids)})
        AND ano = YEAR(GETDATE())
        AND mes = MONTH(GETDATE())
    `;
    const r = rows[0];
    if (!r) {
      return null;
    }
    return { presupuesto: Number(r.presupuesto ?? 0) };
  }

  /**
   * Presupuestos (metas) del mes desde tabla legacy `presupuesto` por fecha_ini/fecha_fin.
   * Alineado con Presupuesto::get_presupuesto_mes_all en PHP; el legacy usa esta tabla para las metas.
   */
  async getPresupuestoMesAll(
    fechaIni: string,
    fechaFin: string,
  ): Promise<Array<{ sede: string; presupuesto: number }>> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT sede, presupuesto
      FROM presupuesto
      WHERE CONVERT(DATE, fecha_ini) = CONVERT(DATE, ${fechaIni})
        AND CONVERT(DATE, fecha_fin) = CONVERT(DATE, ${fechaFin})
      ORDER BY id_presupuesto ASC
    `;
    return (rows ?? []).map((r) => ({
      sede: String(r.sede ?? '').trim(),
      presupuesto: Number(r.presupuesto ?? 0),
    }));
  }

  async getPresupuestoSede(
    ano: number,
    mes: number,
    idsede: number,
  ): Promise<PostvPresupuestoPosventaRow[]> {
    const rows = await this.prisma.$queryRaw<PostvPresupuestoPosventaRow[]>`
      SELECT
        ano, mes, bodega,
        ot_mant_preventivo, ot_mant_correctivo, ot_garantia, ot_retorno, ot_colision, ot_interno,
        rptos_mto_preventivo, rptos_mto_correctivo, rptos_garantia, rptos_retorno, rptos_colision, rptos_interno,
        mo_mto_preventivo, mo_mto_correctivo, mo_garantia, mo_retorno, mo_colision, mo_interno,
        tot_mto_preventivo, tot_mto_correctivo, tot_garantia, tot_retorno, tot_colision, tot_interno,
        mostrador
      FROM postv_presupuesto_posventa
      WHERE bodega = ${idsede} AND ano = 2025 AND mes = 12
    `;
    return rows ?? [];
  }

  async getPresupuestoDia(
    centrosCosto: string,
  ): Promise<{ total: number } | null> {
    const ids = parseIds(centrosCosto);
    if (ids.length === 0) return null;
    // Alineado con legacy Presupuesto::get_presupuesto_dia,
    // que calcula el total diario directamente desde la tabla `movimiento`
    // para los centros de costo indicados en el mes actual.
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT total = SUM(valor * -1)
      FROM movimiento
      WHERE (cuenta LIKE '4135%' OR cuenta LIKE '4175%' OR cuenta LIKE '530535%')
        AND centro IN (${Prisma.join(ids)})
        AND fec BETWEEN CONVERT(DATE, DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0))
          AND CONVERT(DATE, GETDATE())
        AND tipo NOT IN ('SIR', 'IT', 'BC', 'SIK', 'IK', 'SIQ', 'SIL', 'IL', 'SIT', 'SIW', 'WI', 'DIT', 'DIK', 'DIW', 'DIL')
    `;
    const r = rows[0];
    return r ? { total: Number(r.total ?? 0) } : null;
  }

  async getTotalDias(): Promise<{ ultimo_dia?: number } | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT DAY(EOMONTH(GETDATE())) AS ultimo_dia
    `;
    const r = rows[0];
    return r ? { ultimo_dia: Number(r.ultimo_dia) } : null;
  }

  async getDiasActual(): Promise<{ dia?: number } | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT DAY(GETDATE()) AS dia
    `;
    const r = rows[0];
    return r ? { dia: Number(r.dia) } : null;
  }

  async getCalificacionSedeGeneral(): Promise<
    Array<{ Calificacion?: number }>
  > {
    const rows = await this.prisma.$queryRaw<any[]>`
      -- Alineado con legacy Informe::get_calificacion_sede('general'),
      -- que usa la tabla NPS_sedes para la sede "general" en la fecha actual.
      SELECT Calificacion
      FROM NPS_sedes
      WHERE CONVERT(DATE, Fecha) = CONVERT(DATE, GETDATE())
        AND Sede = 'general'
    `;
    return (rows ?? []).map((r) => ({
      Calificacion:
        r.Calificacion != null ? Number(r.Calificacion) : undefined,
    }));
  }

  async getInformeInventario(): Promise<InventarioRow[]> {
    // Alineado con legacy Informe::Informe_inventario,
    // que calcula el inventario directamente desde referencias, v_referencias_cos y v_referencias_sto_hoy.
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        Promedio = v_r.Promedio,
        stock
      FROM referencias r
      INNER JOIN v_referencias_cos v_r ON r.codigo = v_r.codigo
      INNER JOIN v_referencias_sto_hoy vr ON vr.codigo = r.codigo
      WHERE bodega IN (1,3,4,6,7,8,13,23,25,94,95,96,97,98)
        AND stock != 0
        AND v_r.ano = YEAR(CONVERT(DATE, GETDATE()))
        AND v_r.mes = MONTH(CONVERT(DATE, GETDATE()))
        AND r.conversion != -1
        AND r.contable IN (100,105,110)
    `;
    return (rows ?? []).map((r) => ({
      Promedio: r.Promedio != null ? Number(r.Promedio) : undefined,
      stock: Number(r.stock ?? 0),
    }));
  }

  async getDataNpsInternoSedes(sedesIds: string): Promise<NpsSedesMesRow[]> {
    const ids = parseIds(sedesIds);
    if (ids.length === 0) return [];
    // Alineado con legacy Informe::get_data_nps_interno_sedes,
    // que usa postv_encuesta_satisfaccion_qr y filtra por mes/año actual y bodegas.
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        COUNT(CASE WHEN pes.pregunta1 BETWEEN 0 AND 6 THEN 1 END) AS enc0a6,
        COUNT(CASE WHEN pes.pregunta1 BETWEEN 7 AND 8 THEN 1 END) AS enc7a8,
        COUNT(CASE WHEN pes.pregunta1 BETWEEN 9 AND 10 THEN 1 END) AS enc9a10
      FROM postv_encuesta_satisfaccion_qr pes
      INNER JOIN referencias_imp r ON pes.placa = r.placa
      INNER JOIN v_ultima_entrada_taller_datos uet ON r.codigo = uet.uetd_serie
      INNER JOIN tall_encabeza_orden te ON uet.uetd_numero = te.numero
      INNER JOIN terceros t ON te.vendedor = t.nit
      WHERE MONTH(CONVERT(DATE, pes.fecha)) = MONTH(DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0))
        AND YEAR(CONVERT(DATE, pes.fecha)) = YEAR(GETDATE())
        AND pes.bod IN (${Prisma.join(ids)})
    `;
    return (rows ?? []).map((r) => ({
      enc0a6: Number(r.enc0a6 ?? 0),
      enc7a8: Number(r.enc7a8 ?? 0),
      enc9a10: Number(r.enc9a10 ?? 0),
    }));
  }

  async getTotalPresupuestoByCentros(
    centrosCosto: string,
  ): Promise<{ total: number } | null> {
    const ids = parseIds(centrosCosto);
    if (ids.length === 0) return null;
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT total = SUM(valor * -1)
      FROM movimiento
      WHERE (cuenta LIKE '4135%' OR cuenta LIKE '4175%' OR cuenta LIKE '530535%')
        AND centro IN (${Prisma.join(ids)})
        AND fec BETWEEN CONVERT(DATE, DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0))
          AND CONVERT(DATE, GETDATE())
        AND tipo NOT IN (
          'SIR','IT','BC','SIK','IK','SIQ','SIL','IL',
          'SIT','SIW','WI','DIT','DIK','DIW','DIL'
        )
    `;
    const r = rows[0];
    return r ? { total: Number(r.total ?? 0) } : null;
  }

  async getPresupuestoMo(
    centrosCosto: string,
  ): Promise<{ total: number } | null> {
    const ids = parseIds(centrosCosto);
    if (ids.length === 0) return null;
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT total = SUM(valor * -1)
      FROM movimiento
      WHERE (cuenta LIKE '413504%' OR cuenta LIKE '417510%' OR cuenta LIKE '53053560%')
        AND centro IN (${Prisma.join(ids)})
        AND fec BETWEEN CONVERT(DATE, DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0))
          AND CONVERT(DATE, GETDATE())
        AND tipo NOT IN (
          'SIR','IT','BC','SIK','IK','SIQ','SIL','IL',
          'SIT','SIW','WI','DIT','DIK','DIW','DIL'
        )
    `;
    const r = rows[0];
    return r ? { total: Number(r.total ?? 0) } : null;
  }
  //agrego

  async getPresupuestoTot(
    centrosCosto: string,
  ): Promise<{ total: number } | null> {
    const ids = parseIds(centrosCosto);
    if (ids.length === 0) return null;
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT total = SUM(valor * -1)
      FROM movimiento
      WHERE (
        cuenta LIKE '41350410201040%' OR cuenta LIKE '41350410202030%' OR
        cuenta LIKE '41350410502040%' OR cuenta LIKE '41350410503030%' OR
        cuenta LIKE '41350410602040%' OR cuenta LIKE '41350410605030%' OR
        cuenta LIKE '413504107020%' OR cuenta LIKE '413504107050%' OR
        cuenta LIKE '41350410707030%' OR
        cuenta IN (
          '417510101073','417510101074','417510501035','417510501036',
          '417510503020','417510601035','417510601036','417510601037',
          '530535601060'
        )
      )
        AND centro IN (${Prisma.join(ids)})
        AND fec BETWEEN CONVERT(DATE, DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0))
          AND CONVERT(DATE, GETDATE())
        AND tipo NOT IN (
          'SIR','IT','BC','SIK','IK','SIQ','SIL','IL',
          'SIT','SIW','WI','DIT','DIK','DIW','DIL'
        )
    `;
    const r = rows[0];
    return r ? { total: Number(r.total ?? 0) } : null;
  }

  async getPresupuestoRep(
    centrosCosto: string,
  ): Promise<{ total: number } | null> {
    const ids = parseIds(centrosCosto);
    if (ids.length === 0) return null;
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT total = SUM(valor * -1)
      FROM movimiento
      WHERE (cuenta LIKE '413506%' OR cuenta LIKE '417520%' OR cuenta LIKE '53053580%')
        AND centro IN (${Prisma.join(ids)})
        AND fec BETWEEN CONVERT(DATE, DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0))
          AND CONVERT(DATE, GETDATE())
        AND tipo NOT IN (
          'SIR','IT','BC','SIK','IK','SIQ','SIL','IL',
          'SIT','SIW','WI','DIT','DIK','DIW','DIL'
        )
    `;
    const r = rows[0];
    return r ? { total: Number(r.total ?? 0) } : null;
  }
}

