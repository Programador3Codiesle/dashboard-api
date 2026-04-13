import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import { IPanelNpsRepository } from '../../domain/panel-nps.repository';
import {
  PanelNpsDetalleEntity,
  PanelNpsResumenEntity,
  PanelNpsTablaRowEntity,
  SedeSerieNpsEntity,
  TecnicoNpsPorSedeEntity,
} from '../../domain/panel-nps.entity';

@Injectable()
export class PanelNpsPrismaRepository implements IPanelNpsRepository {
  private readonly sedes = ['general', 'giron', 'rosita', 'barranca', 'bocono'];

  /** Sedes con matriz de técnicos (mismo orden que legacy). */
  private readonly sedesConTecnicos = [
    'giron',
    'rosita',
    'barranca',
    'bocono',
  ] as const;

  private readonly meta = 0.8;

  constructor(private readonly prisma: PrismaService) {}

  async obtenerPanel(): Promise<PanelNpsResumenEntity> {
    const series: SedeSerieNpsEntity[] = [];

    for (const sede of this.sedes) {
      const puntos = await this.obtenerSeriePorSede(sede);
      series.push(new SedeSerieNpsEntity({ sede, puntos }));
    }

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

    const mesTabla = await this.mesCalendarioActual();
    const mesesVentana = await this.ventanaMesesIndices();
    const tabla = await this.construirTablaResumen(mesActualRows, mesTabla);
    const tecnicosPorSede = await this.construirTecnicosPorSedeMatriz(
      mesesVentana,
    );

    return new PanelNpsResumenEntity({
      mesesVentana,
      series,
      tabla,
      tecnicosPorSede,
    });
  }

  private async mesCalendarioActual(): Promise<number> {
    const rows = await this.prisma.$queryRaw<{ m: number }[]>(
      Prisma.sql`SELECT MONTH(GETDATE()) AS m`,
    );
    return rows[0]?.m ?? 1;
  }

  private paDesdeEncuestas(
    enc0a6: number,
    enc7a8: number,
    enc9a10: number,
  ): number {
    const toEnc = enc0a6 + enc7a8 + enc9a10;
    if (toEnc <= 0) {
      return 0;
    }
    const numerador = toEnc * this.meta - (enc9a10 - enc0a6);
    const denominador = 1 - this.meta;
    if (denominador === 0) {
      return 0;
    }
    const to = numerador / denominador;
    return to > 0 ? to : 0;
  }

  /** PA en fila técnico: usa totales 9–10 y 0–6 de la fila agregada de la sede (legacy). */
  private paTecnicoTabla(
    enc0a6Tec: number,
    enc7a8Tec: number,
    enc9a10Tec: number,
    enc9a10Sede: number,
    enc0a6Sede: number,
  ): number {
    const toEncTec = enc0a6Tec + enc7a8Tec + enc9a10Tec;
    const numerador = toEncTec * this.meta - (enc9a10Sede - enc0a6Sede);
    const denominador = 1 - this.meta;
    if (denominador === 0) {
      return 0;
    }
    const to = numerador / denominador;
    return to > 0 ? to : 0;
  }

  private npsTablaTecnico(
    enc0a6: number,
    enc7a8: number,
    enc9a10: number,
  ): number {
    const toEnc = enc0a6 + enc7a8 + enc9a10;
    if (toEnc === 0) {
      return 0;
    }
    return Math.round(((enc9a10 - enc0a6) / toEnc) * 100);
  }

  private npsMatrizCelda(
    enc0a6: number,
    enc7a8: number,
    enc9a10: number,
  ): number | null {
    if (enc0a6 === -1 && enc7a8 === -1 && enc9a10 === -1) {
      return null;
    }
    const toEnc = enc0a6 + enc7a8 + enc9a10;
    if (toEnc === 0) {
      return null;
    }
    return Math.round(((enc9a10 - enc0a6) / toEnc) * 100);
  }

  private async construirTablaResumen(
    mesActualRows: {
      sede: string;
      Enc_0_a_6: number | null;
      Enc_7_a_8: number | null;
      Enc_9_a_10: number | null;
      Calificacion: number | null;
    }[],
    mesTabla: number,
  ): Promise<PanelNpsTablaRowEntity[]> {
    const tabla: PanelNpsTablaRowEntity[] = [];

    const filaSede = (sede: string): PanelNpsTablaRowEntity => {
      const row = mesActualRows.find((r) => r.sede === sede);
      const enc0a6 = row?.Enc_0_a_6 ?? 0;
      const enc7a8 = row?.Enc_7_a_8 ?? 0;
      const enc9a10 = row?.Enc_9_a_10 ?? 0;
      const calificacion = row?.Calificacion ?? 0;
      const to = this.paDesdeEncuestas(enc0a6, enc7a8, enc9a10);
      return new PanelNpsTablaRowEntity({
        tipo: 'sede',
        sede,
        enc0a6,
        enc7a8,
        enc9a10,
        to,
        nps: calificacion,
        meta: 80,
      });
    };

    tabla.push(filaSede('general'));

    for (const sede of this.sedesConTecnicos) {
      const agg = filaSede(sede);
      tabla.push(agg);

      const tecnicos = await this.obtenerTecnicosNpsTablaMes(sede, mesTabla);
      for (const t of tecnicos) {
        const to = this.paTecnicoTabla(
          t.enc0a6,
          t.enc7a8,
          t.enc9a10,
          agg.enc9a10,
          agg.enc0a6,
        );
        const nps = this.npsTablaTecnico(t.enc0a6, t.enc7a8, t.enc9a10);
        tabla.push(
          new PanelNpsTablaRowEntity({
            tipo: 'tecnico',
            sede,
            enc0a6: t.enc0a6,
            enc7a8: t.enc7a8,
            enc9a10: t.enc9a10,
            to,
            nps,
            meta: 80,
            nitTecnico: String(t.nit_tecnico),
            nombreTecnico: t.tecnico,
          }),
        );
      }
    }

    return tabla;
  }

  private async obtenerTecnicosNpsTablaMes(
    sede: string,
    mes: number,
  ): Promise<
    {
      nit_tecnico: string | number;
      tecnico: string;
      enc0a6: number;
      enc7a8: number;
      enc9a10: number;
    }[]
  > {
    return this.prisma.$queryRaw<
      {
        nit_tecnico: string | number;
        tecnico: string;
        enc0a6: number;
        enc7a8: number;
        enc9a10: number;
      }[]
    >(Prisma.sql`
      SELECT
        te.nit_tecnico,
        te.tecnico,
        ISNULL(SUM(e.enc9a10), 0) AS enc9a10,
        ISNULL(SUM(e.enc7a8), 0) AS enc7a8,
        ISNULL(SUM(e.enc0a6), 0) AS enc0a6
      FROM (
        SELECT DISTINCT
          e.nit_tecnico,
          t.nombres AS tecnico,
          e.sede
        FROM postv_encuestas_gm e
        INNER JOIN terceros t ON e.nit_tecnico = t.nit
        WHERE e.sede = ${sede}
      ) te
      LEFT JOIN (
        SELECT
          nit_tecnico,
          sede,
          MONTH(fecha_recibido_enc) AS mes,
          COUNT(
            CASE
              WHEN recomendacion_concesionario BETWEEN 0 AND 6 THEN 1
            END
          ) AS enc0a6,
          COUNT(
            CASE
              WHEN recomendacion_concesionario BETWEEN 7 AND 8 THEN 1
            END
          ) AS enc7a8,
          COUNT(
            CASE
              WHEN recomendacion_concesionario BETWEEN 9 AND 10 THEN 1
            END
          ) AS enc9a10
        FROM postv_encuestas_gm peg
        WHERE fecha_recibido_enc >= '20220101'
          AND peg.sede = ${sede}
        GROUP BY sede, fecha_recibido_enc, nit_tecnico
      ) e
        ON te.nit_tecnico = e.nit_tecnico
       AND te.sede = e.sede
       AND e.mes = ${mes}
      GROUP BY te.nit_tecnico, te.tecnico, te.sede
      ORDER BY te.tecnico, te.sede
    `);
  }

  private async ventanaMesesIndices(): Promise<number[]> {
    const meses: number[] = [];
    for (let i = 5; i >= 0; i--) {
      const rows = await this.prisma.$queryRaw<{ mes: number }[]>(
        Prisma.sql`SELECT MONTH(DATEADD(MONTH, -${i}, GETDATE())) AS mes`,
      );
      meses.push(rows[0]?.mes ?? 1);
    }
    return meses;
  }

  private async construirTecnicosPorSedeMatriz(
    mesesOrden: number[],
  ): Promise<TecnicoNpsPorSedeEntity[]> {
    const sedesList = [...this.sedesConTecnicos];

    const techRowsRaw = await this.prisma.$queryRaw<
      { nit_tecnico: string | number; sede: string; nombre: string }[]
    >(Prisma.sql`
      SELECT DISTINCT
        peg.nit_tecnico,
        peg.sede,
        t.nombres AS nombre
      FROM postv_encuestas_gm peg
      INNER JOIN terceros t ON peg.nit_tecnico = t.nit
      WHERE peg.sede IN (${Prisma.join(sedesList)})
    `);

    const porSede = new Map<string, typeof techRowsRaw>();
    for (const s of sedesList) {
      porSede.set(s, []);
    }
    for (const row of techRowsRaw) {
      porSede.get(row.sede)?.push(row);
    }
    const techRows: typeof techRowsRaw = [];
    for (const s of this.sedesConTecnicos) {
      const list = (porSede.get(s) ?? []).sort((a, b) =>
        a.nombre.localeCompare(b.nombre, 'es'),
      );
      techRows.push(...list);
    }

    const aggRows = await this.prisma.$queryRaw<
      {
        nit_tecnico: string | number;
        sede: string;
        mes: number;
        enc0a6: number;
        enc7a8: number;
        enc9a10: number;
      }[]
    >(Prisma.sql`
      SELECT
        nit_tecnico,
        sede,
        MONTH(fecha_recibido_enc) AS mes,
        COUNT(
          CASE
            WHEN recomendacion_concesionario BETWEEN 0 AND 6 THEN 1
          END
        ) AS enc0a6,
        COUNT(
          CASE
            WHEN recomendacion_concesionario BETWEEN 7 AND 8 THEN 1
          END
        ) AS enc7a8,
        COUNT(
          CASE
            WHEN recomendacion_concesionario BETWEEN 9 AND 10 THEN 1
          END
        ) AS enc9a10
      FROM postv_encuestas_gm peg
      WHERE fecha_recibido_enc >= '20220101'
        AND peg.sede IN (${Prisma.join(sedesList)})
      GROUP BY nit_tecnico, sede, MONTH(fecha_recibido_enc)
    `);

    const aggMap = new Map<
      string,
      { enc0a6: number; enc7a8: number; enc9a10: number }
    >();
    for (const r of aggRows) {
      const key = `${r.sede}|${String(r.nit_tecnico)}|${r.mes}`;
      aggMap.set(key, {
        enc0a6: r.enc0a6,
        enc7a8: r.enc7a8,
        enc9a10: r.enc9a10,
      });
    }

    const resultado: TecnicoNpsPorSedeEntity[] = [];

    for (const row of techRows) {
      const nit = String(row.nit_tecnico);
      const puntos = mesesOrden.map((mes) => {
        const key = `${row.sede}|${nit}|${mes}`;
        const cell = aggMap.get(key);
        if (!cell) {
          return { mes, nps: null };
        }
        return {
          mes,
          nps: this.npsMatrizCelda(cell.enc0a6, cell.enc7a8, cell.enc9a10),
        };
      });
      resultado.push(
        new TecnicoNpsPorSedeEntity({
          sede: row.sede,
          nit,
          nombre: row.nombre,
          puntos,
        }),
      );
    }

    return resultado;
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
          AND peg.sede = ${sede}
        GROUP BY sede, fecha_recibido_enc, nit_tecnico
      ) e
        ON te.nit_tecnico = e.nit_tecnico
       AND te.sede = e.sede
       AND te.mes = e.mes
      WHERE te.sede = ${sede}
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
    const rows = await this.prisma.$queryRaw<{ nom_mes: string }[]>(
      Prisma.sql`
        SELECT CONVERT(
          varchar(10),
          DATENAME(month, DATEFROMPARTS(YEAR(GETDATE()), ${mesNumero}, 1))
        ) AS nom_mes
      `,
    );

    return rows[0]?.nom_mes ?? null;
  }
}
