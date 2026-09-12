import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CODIESEL_EMPRESA_ID } from '../../../../../../core/config/empresa-sesion';
import { listarIdsBodegaEmpresa } from '../../../../../../core/infra/prisma/bodegas-empresa.query';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import {
  EncuestaSatisfaccionBodegaEntity,
  EncuestaSatisfaccionResumenEntity,
  EncuestaSatisfaccionTecnicoEntity,
} from '../../domain/encuesta-satisfaccion.entity';
import {
  FiltrosEncuestaSatisfaccion,
  IEncuestaSatisfaccionRepository,
} from '../../domain/encuesta-satisfaccion.repository';

const BODEGAS_COMBO_CODIESEL: { value: string; label: string }[] = [
  { value: '1', label: 'GASOLINA GIRON' },
  { value: '2', label: 'DIESEL GIRON' },
  { value: '3', label: 'ELECTRICISTAS' },
  { value: '4', label: 'GASOLINA BARRANCA' },
  { value: '5', label: 'DIESEL BARRANCA' },
  { value: '6', label: 'GASOLINA ROSITA' },
  { value: '7', label: 'GASOLINA BOCONO' },
  { value: '8', label: 'ALINEADORES' },
  { value: '9', label: 'DIESEL BOCONO' },
];

@Injectable()
export class EncuestaSatisfaccionPrismaRepository implements IEncuestaSatisfaccionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listarResumen(
    filtros: FiltrosEncuestaSatisfaccion,
  ): Promise<EncuestaSatisfaccionResumenEntity[]> {
    const { fi, ff, bode, tec, cli, ot, ns, empresaId } = filtros;

    if (!fi || !ff) {
      throw new Error('El rango de fechas es obligatorio.');
    }

    const bodegasEmpresa = await listarIdsBodegaEmpresa(this.prisma, empresaId);
    const extraBodega = this.sqlFiltroBodega(empresaId, bode, bodegasEmpresa);
    if (extraBodega === null) return [];

    // Replicamos la lógica de branching del legacy (Encuesta::generar_Informe_encuesta_satisfaccion)
    let sql: Prisma.Sql;

    if (bode === 'todas' && tec === 'all' && !cli && !ot && (!ns || ns === 0)) {
      sql = this.sqlInfGral(fi, ff, extraBodega);
    } else if (
      bode !== 'todas' &&
      tec === 'all' &&
      !cli &&
      !ot &&
      (!ns || ns === 0)
    ) {
      sql = this.sqlInfGralBod(fi, ff, extraBodega);
    } else if (
      bode !== 'todas' &&
      tec !== 'all' &&
      !cli &&
      !ot &&
      (!ns || ns === 0)
    ) {
      sql = this.sqlInfGralTec(fi, ff, tec, extraBodega);
    } else if (
      bode !== 'todas' &&
      tec !== 'all' &&
      cli &&
      !ot &&
      (!ns || ns === 0)
    ) {
      sql = this.sqlInfGralCli(fi, ff, cli, extraBodega);
    } else if (
      bode === 'todas' &&
      tec === 'all' &&
      cli &&
      !ot &&
      (!ns || ns === 0)
    ) {
      sql = this.sqlInfGralCli(fi, ff, cli, extraBodega);
    } else if (
      bode === 'todas' &&
      tec === 'all' &&
      ot &&
      !cli &&
      (!ns || ns === 0)
    ) {
      sql = this.sqlInfGralOt(fi, ff, ot, extraBodega);
    } else if (
      bode !== 'todas' &&
      tec === 'all' &&
      ot &&
      !cli &&
      (!ns || ns === 0)
    ) {
      sql = this.sqlInfGralOt(fi, ff, ot, extraBodega);
    } else if (bode !== 'todas' && tec === 'all' && !ot && ns && ns !== 0) {
      sql = this.sqlInfGralNs(fi, ff, ns, extraBodega);
    } else if (bode === 'todas' && tec === 'all' && !ot && ns && ns !== 0) {
      sql = this.sqlInfGralNs(fi, ff, ns, extraBodega);
    } else {
      return [];
    }

    const rows = await this.prisma.$queryRaw<
      {
        vendedor: string;
        nombres: string;
        prom_p1: number;
        prom_p2: number;
      }[]
    >(sql);

    return rows.map(
      (row) =>
        new EncuestaSatisfaccionResumenEntity({
          vendedor: row.vendedor,
          nombres: row.nombres,
          promP1: row.prom_p1,
          promP2: row.prom_p2,
        }),
    );
  }

  private sqlFiltroBodega(
    empresaId: number,
    bode: string,
    bodegasEmpresa: number[],
  ): Prisma.Sql | null {
    if (empresaId === CODIESEL_EMPRESA_ID) {
      if (bode === 'todas') {
        if (bodegasEmpresa.length === 0) return Prisma.sql`AND 1 = 1`;
        return Prisma.sql`AND teo.bodega IN (${Prisma.join(bodegasEmpresa)})`;
      }
      return Prisma.sql`AND teo.bodega = ${bode}`;
    }

    if (bodegasEmpresa.length === 0) return null;
    if (bode === 'todas') {
      return Prisma.sql`AND teo.bodega IN (${Prisma.join(bodegasEmpresa)})`;
    }
    const bodeNum = Number(bode);
    if (!Number.isFinite(bodeNum) || !bodegasEmpresa.includes(bodeNum)) {
      return null;
    }
    return Prisma.sql`AND teo.bodega = ${bodeNum}`;
  }

  private sqlBase(fi: string, ff: string, extra: Prisma.Sql): Prisma.Sql {
    return Prisma.sql`
      FROM posv_encuesta_satisfaccion pes
      INNER JOIN tall_encabeza_orden teo ON teo.numero = pes.n_orden
      INNER JOIN terceros t ON t.nit_real = teo.vendedor
      CROSS APPLY (
        SELECT COALESCE(
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 23),
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 103),
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''))
        ) AS fecha_dt
      ) AS fd
      WHERE fd.fecha_dt BETWEEN CONVERT(DATE, ${fi}) AND CONVERT(DATE, ${ff})
      ${extra}
    `;
  }

  private sqlInfGral(fi: string, ff: string, extra: Prisma.Sql): Prisma.Sql {
    const base = this.sqlBase(fi, ff, extra);
    return Prisma.sql`
      SELECT  t.nombres, teo.vendedor, AVG(pes.pregunta1) AS prom_p1, AVG(pes.pregunta2) AS prom_p2
      ${base}
      GROUP BY teo.vendedor, t.nombres
    `;
  }

  private sqlInfGralBod(fi: string, ff: string, extra: Prisma.Sql): Prisma.Sql {
    const base = Prisma.sql`
      FROM posv_encuesta_satisfaccion pes
      INNER JOIN tall_encabeza_orden teo ON teo.numero = pes.n_orden
      INNER JOIN terceros t ON t.nit_real = teo.vendedor
      INNER JOIN bodegas b ON b.bodega = teo.bodega
      CROSS APPLY (
        SELECT COALESCE(
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 23),
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 103),
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''))
        ) AS fecha_dt
      ) AS fd
      WHERE fd.fecha_dt BETWEEN CONVERT(DATE, ${fi}) AND CONVERT(DATE, ${ff})
      ${extra}
    `;
    return Prisma.sql`
      SELECT  t.nombres, teo.vendedor, AVG(pes.pregunta1) AS prom_p1, AVG(pes.pregunta2) AS prom_p2
      ${base}
      GROUP BY teo.vendedor, t.nombres
    `;
  }

  private sqlInfGralTec(
    fi: string,
    ff: string,
    tec: string,
    extra: Prisma.Sql,
  ): Prisma.Sql {
    const base = Prisma.sql`
      FROM posv_encuesta_satisfaccion pes
      INNER JOIN tall_encabeza_orden teo ON teo.numero = pes.n_orden
      INNER JOIN terceros t ON t.nit_real = teo.vendedor
      INNER JOIN bodegas b ON b.bodega = teo.bodega
      CROSS APPLY (
        SELECT COALESCE(
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 23),
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 103),
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''))
        ) AS fecha_dt
      ) AS fd
      WHERE fd.fecha_dt BETWEEN CONVERT(DATE, ${fi}) AND CONVERT(DATE, ${ff})
      AND teo.vendedor = ${tec}
      ${extra}
    `;
    return Prisma.sql`
      SELECT  t.nombres, teo.vendedor, AVG(pes.pregunta1) AS prom_p1, AVG(pes.pregunta2) AS prom_p2
      ${base}
      GROUP BY teo.vendedor, t.nombres
    `;
  }

  private sqlInfGralCli(
    fi: string,
    ff: string,
    cli: string,
    extra: Prisma.Sql,
  ): Prisma.Sql {
    const base = Prisma.sql`
      FROM posv_encuesta_satisfaccion pes
      INNER JOIN tall_encabeza_orden teo ON teo.numero = pes.n_orden
      INNER JOIN terceros t ON t.nit_real = teo.vendedor
      INNER JOIN bodegas b ON b.bodega = teo.bodega
      CROSS APPLY (
        SELECT COALESCE(
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 23),
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 103),
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''))
        ) AS fecha_dt
      ) AS fd
      WHERE fd.fecha_dt BETWEEN CONVERT(DATE, ${fi}) AND CONVERT(DATE, ${ff})
      AND teo.nit = ${cli}
      ${extra}
    `;
    return Prisma.sql`
      SELECT  t.nombres, teo.vendedor, AVG(pes.pregunta1) AS prom_p1, AVG(pes.pregunta2) AS prom_p2
      ${base}
      GROUP BY teo.vendedor, t.nombres
    `;
  }

  private sqlInfGralOt(
    fi: string,
    ff: string,
    ot: string,
    extra: Prisma.Sql,
  ): Prisma.Sql {
    const base = Prisma.sql`
      FROM posv_encuesta_satisfaccion pes
      INNER JOIN tall_encabeza_orden teo ON teo.numero = pes.n_orden
      INNER JOIN terceros t ON t.nit_real = teo.vendedor
      INNER JOIN bodegas b ON b.bodega = teo.bodega
      CROSS APPLY (
        SELECT COALESCE(
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 23),
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 103),
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''))
        ) AS fecha_dt
      ) AS fd
      WHERE fd.fecha_dt BETWEEN CONVERT(DATE, ${fi}) AND CONVERT(DATE, ${ff})
      AND teo.numero = ${ot}
      ${extra}
    `;
    return Prisma.sql`
      SELECT  t.nombres, teo.vendedor, AVG(pes.pregunta1) AS prom_p1, AVG(pes.pregunta2) AS prom_p2
      ${base}
      GROUP BY teo.vendedor, t.nombres
    `;
  }

  private sqlInfGralNs(
    fi: string,
    ff: string,
    ns: number,
    extra: Prisma.Sql,
  ): Prisma.Sql {
    let ns1 = 0;
    let ns2 = 0;

    if (ns === 10) {
      ns1 = 10;
      ns2 = 10;
    } else if (ns === 8) {
      ns1 = 8;
      ns2 = 9;
    } else if (ns === 7) {
      ns1 = 6;
      ns2 = 8;
    } else if (ns === 6) {
      ns1 = 0;
      ns2 = 5;
    }

    const base = Prisma.sql`
      FROM posv_encuesta_satisfaccion pes
      INNER JOIN tall_encabeza_orden teo ON teo.numero = pes.n_orden
      INNER JOIN terceros t ON t.nit_real = teo.vendedor
      INNER JOIN bodegas b ON b.bodega = teo.bodega
      CROSS APPLY (
        SELECT COALESCE(
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 23),
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 103),
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''))
        ) AS fecha_dt
      ) AS fd
      WHERE fd.fecha_dt BETWEEN CONVERT(DATE, ${fi}) AND CONVERT(DATE, ${ff})
      ${extra}
      GROUP BY teo.vendedor, t.nombres
      HAVING
        AVG(pes.pregunta1) >= ${ns1}
        AND AVG(pes.pregunta1) <= ${ns2}
        OR AVG(pes.pregunta2) >= ${ns1}
        AND AVG(pes.pregunta2) <= ${ns2}
    `;

    return Prisma.sql`
      SELECT  t.nombres, teo.vendedor, AVG(pes.pregunta1) AS prom_p1, AVG(pes.pregunta2) AS prom_p2
      ${base}
    `;
  }

  async listarBodegas(
    empresaId: number,
  ): Promise<EncuestaSatisfaccionBodegaEntity[]> {
    if (empresaId === CODIESEL_EMPRESA_ID) {
      return BODEGAS_COMBO_CODIESEL.map(
        (row) => new EncuestaSatisfaccionBodegaEntity(row),
      );
    }

    const rows = await this.prisma.$queryRaw<
      { bodega: number; descripcion: string }[]
    >`
      SELECT b.bodega, b.descripcion
      FROM bodegas b
      INNER JOIN bodegas_empresa be
        ON be.id_bodega = b.bodega AND be.id_empresa = ${empresaId}
      ORDER BY b.descripcion, b.bodega
    `;

    return (rows ?? []).map(
      (row) =>
        new EncuestaSatisfaccionBodegaEntity({
          value: String(row.bodega),
          label: row.descripcion,
        }),
    );
  }

  /**
   * Combo técnico/asesor.
   * Codiesel: Encuesta::llenar_combo_tecnicos (patio 1–9).
   * Otras empresas: tall_operarios_intranet.bodega de bodegas_empresa.
   */
  async listarTecnicos(
    bode: string,
    empresaId: number,
  ): Promise<EncuestaSatisfaccionTecnicoEntity[]> {
    if (empresaId === CODIESEL_EMPRESA_ID) {
      const patios = this.patiosPorComboBodega(bode);
      if (!patios) return [];

      const rows = await this.prisma.$queryRaw<
        { nit: string | number; nombre: string }[]
      >(Prisma.sql`
        SELECT nit, nombre
        FROM tall_operarios_intranet
        WHERE patio IN (${Prisma.join(patios)})
        ORDER BY nombre, nit
      `);

      return rows.map(
        (row) =>
          new EncuestaSatisfaccionTecnicoEntity({
            nit: String(row.nit),
            nombre: row.nombre,
          }),
      );
    }

    const bodeNum = Number(bode);
    if (!Number.isFinite(bodeNum)) return [];

    const bodegasEmpresa = await listarIdsBodegaEmpresa(this.prisma, empresaId);
    if (!bodegasEmpresa.includes(bodeNum)) return [];

    const rows = await this.prisma.$queryRaw<
      { nit: string | number; nombre: string }[]
    >(Prisma.sql`
      SELECT nit, nombre
      FROM tall_operarios_intranet
      WHERE bodega = ${bodeNum}
      ORDER BY nombre, nit
    `);

    return rows.map(
      (row) =>
        new EncuestaSatisfaccionTecnicoEntity({
          nit: String(row.nit),
          nombre: row.nombre,
        }),
    );
  }

  private patiosPorComboBodega(bode: string): number[] | null {
    switch (bode) {
      case '1':
        return [1, 13, 12];
      case '2':
        return [3];
      case '3':
        return [11];
      case '4':
        return [5];
      case '5':
        return [6];
      case '6':
        return [4];
      case '7':
        return [7];
      case '8':
        return [12];
      case '9':
        return [8];
      default:
        return null;
    }
  }
}
