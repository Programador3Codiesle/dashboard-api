import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import { IPanelNpsRepository } from '../../domain/panel-nps.repository';
import {
  PanelNpsDetalleEntity,
  PanelNpsResumenEntity,
  PanelNpsTablaRowEntity,
  SedeSerieNpsEntity,
} from '../../domain/panel-nps.entity';

@Injectable()
export class PanelNpsPrismaRepository implements IPanelNpsRepository {
  private readonly sedes = ['general', 'giron', 'rosita', 'barranca', 'bocono'];

  constructor(private readonly prisma: PrismaService) {}

  async obtenerPanel(): Promise<PanelNpsResumenEntity> {
    const series: SedeSerieNpsEntity[] = [];

    for (const sede of this.sedes) {
      const puntos = await this.obtenerSeriePorSede(sede);
      series.push(new SedeSerieNpsEntity({ sede, puntos }));
    }

    const tabla: PanelNpsTablaRowEntity[] = [];
    const mesActualRows = await this.prisma.$queryRaw<
      {
        sede: string;
        Enc_0_a_6: number | null;
        Enc_7_a_8: number | null;
        Enc_9_a_10: number | null;
        Calificacion: number | null;
      }[]
    >(Prisma.sql`
      SELECT
        s.sede,
        s.Enc_0_a_6,
        s.Enc_7_a_8,
        s.Enc_9_a_10,
        s.Calificacion
      FROM (
        SELECT
          sede,
          Enc_0_a_6,
          Enc_7_a_8,
          Enc_9_a_10,
          Calificacion,
          ROW_NUMBER() OVER (
            PARTITION BY sede, MONTH(CONVERT(DATE, Fecha))
            ORDER BY Fecha DESC
          ) AS rn
        FROM NPS_sedes
        WHERE MONTH(CONVERT(DATE, Fecha)) = MONTH(GETDATE())
          AND sede IN (${Prisma.join(this.sedes)})
      ) s
      WHERE s.rn = 1
    `);

    const meta = 0.8;

    for (const sede of this.sedes) {
      const row = mesActualRows.find((r) => r.sede === sede);
      const enc0a6 = row?.Enc_0_a_6 ?? 0;
      const enc7a8 = row?.Enc_7_a_8 ?? 0;
      const enc9a10 = row?.Enc_9_a_10 ?? 0;
      const calificacion = row?.Calificacion ?? 0;

      const toEnc = enc0a6 + enc7a8 + enc9a10;
      let to = 0;
      if (toEnc > 0) {
        const numerador = toEnc * meta - (enc9a10 - enc0a6);
        const denominador = 1 - meta;
        if (denominador !== 0) {
          to = numerador / denominador;
        }
      }

      tabla.push(
        new PanelNpsTablaRowEntity({
          sede,
          enc0a6,
          enc7a8,
          enc9a10,
          to,
          nps: calificacion,
          meta: 80,
        }),
      );
    }

    return new PanelNpsResumenEntity({ series, tabla });
  }

  private async obtenerSeriePorSede(sede: string) {
    const puntos: { mes: number; nps: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const rows = await this.prisma.$queryRaw<
        { Calificacion: number | null; mes: number }[]
      >(Prisma.sql`
        SELECT TOP 1
          Calificacion,
          MONTH(Fecha) AS mes
        FROM NPS_sedes
        WHERE sede = ${sede}
          AND MONTH(CONVERT(DATE, Fecha)) = MONTH(DATEADD(MONTH, -${i}, GETDATE()))
        ORDER BY Fecha DESC
      `);

      if (rows.length > 0 && rows[0].Calificacion !== null) {
        puntos.push({
          mes: rows[0].mes,
          nps: rows[0].Calificacion,
        });
      }
    }

    return puntos;
  }

  async obtenerDetalleTecnico(params: {
    nit: string;
    mes: number;
    sede: string;
  }): Promise<PanelNpsDetalleEntity | null> {
    const { nit, mes, sede } = params;

    const rows = await this.prisma.$queryRaw<
      {
        tecnico: string;
        sede: string;
        mes: number;
        enc0a6: number | null;
        enc7a8: number | null;
        enc9a10: number | null;
      }[]
    >(Prisma.sql`
      SELECT
        te.tecnico,
        te.sede,
        te.mes,
        ISNULL(SUM(e.enc9a10), -1)   AS enc9a10,
        ISNULL(SUM(e.enc7a8), -1)   AS enc7a8,
        ISNULL(SUM(e.enc0a6), -1)   AS enc0a6
      FROM (
        SELECT DISTINCT
          nit_tecnico,
          t.nombres AS tecnico,
          sede,
          MONTH(DATEADD(MONTH, -5, GETDATE())) AS mes
        FROM postv_encuestas_gm e
        INNER JOIN terceros t ON e.nit_tecnico = t.nit
        UNION
        SELECT DISTINCT
          nit_tecnico,
          t.nombres AS tecnico,
          sede,
          MONTH(DATEADD(MONTH, -4, GETDATE())) AS mes
        FROM postv_encuestas_gm e
        INNER JOIN terceros t ON e.nit_tecnico = t.nit
        UNION
        SELECT DISTINCT
          nit_tecnico,
          t.nombres AS tecnico,
          sede,
          MONTH(DATEADD(MONTH, -3, GETDATE())) AS mes
        FROM postv_encuestas_gm e
        INNER JOIN terceros t ON e.nit_tecnico = t.nit
        UNION
        SELECT DISTINCT
          nit_tecnico,
          t.nombres AS tecnico,
          sede,
          MONTH(DATEADD(MONTH, -2, GETDATE())) AS mes
        FROM postv_encuestas_gm e
        INNER JOIN terceros t ON e.nit_tecnico = t.nit
        UNION
        SELECT DISTINCT
          nit_tecnico,
          t.nombres AS tecnico,
          sede,
          MONTH(DATEADD(MONTH, -1, GETDATE())) AS mes
        FROM postv_encuestas_gm e
        INNER JOIN terceros t ON e.nit_tecnico = t.nit
        UNION
        SELECT DISTINCT
          nit_tecnico,
          t.nombres AS tecnico,
          sede,
          MONTH(DATEADD(MONTH, 0, GETDATE())) AS mes
        FROM postv_encuestas_gm e
        INNER JOIN terceros t ON e.nit_tecnico = t.nit
      ) te
      LEFT JOIN (
        SELECT
          nit_tecnico,
          sede,
          MONTH(fecha_recibido_enc) AS mes,
          COUNT(
            CASE
              WHEN recomendacion_concesionario BETWEEN 0 AND 6 THEN 'enc0a6'
            END
          ) AS enc0a6,
          COUNT(
            CASE
              WHEN recomendacion_concesionario BETWEEN 7 AND 8 THEN 'enc7a8'
            END
          ) AS enc7a8,
          COUNT(
            CASE
              WHEN recomendacion_concesionario BETWEEN 9 AND 10 THEN 'enc9a10'
            END
          ) AS enc9a10
        FROM postv_encuestas_gm peg
        WHERE fecha_recibido_enc >= '20220101'
          AND sede IN (${sede})
        GROUP BY sede, fecha_recibido_enc, nit_tecnico
      ) e
        ON te.nit_tecnico = e.nit_tecnico
       AND te.sede = e.sede
       AND te.mes = e.mes
      WHERE te.sede IN (${sede})
        AND te.mes = ${mes}
        AND te.nit_tecnico = ${nit}
      GROUP BY te.tecnico, te.sede, te.nit_tecnico, te.mes
      ORDER BY te.tecnico, te.sede, te.mes
    `);

    if (!rows.length) {
      return null;
    }

    const r = rows[0];
    const enc0a6 = r.enc0a6 ?? 0;
    const enc7a8 = r.enc7a8 ?? 0;
    const enc9a10 = r.enc9a10 ?? 0;

    const mesNombreRows = await this.obtenerNombreMes(mes);
    const mesNombre = mesNombreRows ?? '';

    return new PanelNpsDetalleEntity({
      scope: 'tecnico',
      titulo: r.tecnico,
      sede: r.sede,
      mesNumero: r.mes,
      mesNombre,
      enc0a6,
      enc7a8,
      enc9a10,
    });
  }

  async obtenerDetalleSede(params: {
    sede: string;
    mes: number;
  }): Promise<PanelNpsDetalleEntity | null> {
    const { sede, mes } = params;

    const rows = await this.prisma.$queryRaw<
      {
        Enc_0_a_6: number | null;
        Enc_7_a_8: number | null;
        Enc_9_a_10: number | null;
      }[]
    >(Prisma.sql`
      SELECT TOP 1
        Enc_0_a_6,
        Enc_7_a_8,
        Enc_9_a_10
      FROM NPS_sedes
      WHERE sede = ${sede}
        AND MONTH(CONVERT(DATE, Fecha)) = ${mes}
      ORDER BY Fecha DESC
    `);

    if (!rows.length) {
      return null;
    }

    const r = rows[0];
    const enc0a6 = r.Enc_0_a_6 ?? 0;
    const enc7a8 = r.Enc_7_a_8 ?? 0;
    const enc9a10 = r.Enc_9_a_10 ?? 0;

    const mesNombreRows = await this.obtenerNombreMes(mes);
    const mesNombre = mesNombreRows ?? '';

    return new PanelNpsDetalleEntity({
      scope: 'sede',
      titulo: sede,
      sede,
      mesNumero: mes,
      mesNombre,
      enc0a6,
      enc7a8,
      enc9a10,
    });
  }

  async obtenerDetalleGeneral(params: {
    mes: number;
  }): Promise<PanelNpsDetalleEntity | null> {
    const { mes } = params;

    const rows = await this.prisma.$queryRaw<
      {
        Enc_0_a_6: number | null;
        Enc_7_a_8: number | null;
        Enc_9_a_10: number | null;
      }[]
    >(Prisma.sql`
      SELECT TOP 1
        Enc_0_a_6,
        Enc_7_a_8,
        Enc_9_a_10
      FROM NPS_sedes
      WHERE sede = 'general'
        AND MONTH(CONVERT(DATE, Fecha)) = ${mes}
      ORDER BY Fecha DESC
    `);

    if (!rows.length) {
      return null;
    }

    const r = rows[0];
    const enc0a6 = r.Enc_0_a_6 ?? 0;
    const enc7a8 = r.Enc_7_a_8 ?? 0;
    const enc9a10 = r.Enc_9_a_10 ?? 0;

    const mesNombreRows = await this.obtenerNombreMes(mes);
    const mesNombre = mesNombreRows ?? '';

    return new PanelNpsDetalleEntity({
      scope: 'general',
      titulo: 'Todas las sedes',
      sede: 'general',
      mesNumero: mes,
      mesNombre,
      enc0a6,
      enc7a8,
      enc9a10,
    });
  }

  private async obtenerNombreMes(mesNumero: number): Promise<string | null> {
    const anio = 2022;
    const mesStr = `${mesNumero}`.padStart(2, '0');
    const fechaStr = `${anio}-${mesStr}-01`;

    const rows = await this.prisma.$queryRaw<{ nom_mes: string }[]>(
      Prisma.sql`
        SELECT CONVERT(varchar(10), DATENAME(month, CONVERT(DATE, ${fechaStr}))) AS nom_mes
      `,
    );

    return rows[0]?.nom_mes ?? null;
  }
}

