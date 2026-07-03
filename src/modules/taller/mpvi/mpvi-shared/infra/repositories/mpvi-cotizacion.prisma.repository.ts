import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import {
  CotizacionContactRow,
  CotizacionDetalleInsert,
  CotizacionEncabezadoRow,
  CotizacionFirmaRow,
  CreadorCotizacionRow,
  DatosByPlacaRow,
  DisponibilidadItemRow,
  IMpviCotizacionRepository,
  StockRepuestoRow,
  SubsistemaByVhRow,
  ValorManoObraPdfRow,
  ValorManoObraRow,
  ValorRepuestoPdfRow,
  ValorRepuestoRow,
} from '../../domain/mpvi-cotizacion.repository';

function parseSubsistemaIds(subsistemas: string): number[] {
  return subsistemas
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n));
}

function toJsNumber(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'number') return value;
  if (typeof value === 'object' && value !== null && 'toNumber' in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeManoObraRow(row: ValorManoObraRow): ValorManoObraRow {
  return {
    ...row,
    id_vh: toJsNumber(row.id_vh),
    id_subsistema: toJsNumber(row.id_subsistema),
    id_tempario: toJsNumber(row.id_tempario),
    tiempo: toJsNumber(row.tiempo),
    valor: toJsNumber(row.valor),
    total: toJsNumber(row.total),
  };
}

function normalizeRepuestoRow(row: ValorRepuestoRow): ValorRepuestoRow {
  return {
    ...row,
    id_vh: toJsNumber(row.id_vh),
    id_subsistema: toJsNumber(row.id_subsistema),
    cantidad: toJsNumber(row.cantidad),
    disp: toJsNumber(row.disp),
    valor: toJsNumber(row.valor),
    descuento: toJsNumber(row.descuento),
    total: toJsNumber(row.total),
  };
}

function buildPdfFilterFragments(
  quienVisualiza: number | string = '',
  esPDF: boolean | null = null,
  pdfGestion: boolean | number = false,
): { visualizacion: Prisma.Sql; ejecutadoAutoriza: Prisma.Sql } {
  const qv = Number(quienVisualiza);
  let visualizacion = Prisma.empty;

  if (qv === 1) {
    visualizacion = Prisma.sql`AND u.perfil_postventa IN (24, 33)`;
  } else if (qv === 2) {
    visualizacion = Prisma.sql`AND u.perfil_postventa = 31`;
  }

  if (qv === 0) {
    visualizacion = Prisma.empty;
  }
  if (esPDF == null) {
    visualizacion = Prisma.empty;
  }

  let ejecutadoAutoriza = Prisma.empty;
  if (esPDF != null) {
    visualizacion = Prisma.empty;
    if (pdfGestion === 0 || pdfGestion === false) {
      ejecutadoAutoriza = Prisma.sql`AND cd.autorizado = 1 AND cd.ejecutado = 1`;
    } else if (pdfGestion === 2) {
      ejecutadoAutoriza = Prisma.sql`AND cd.autorizado = 0 AND cd.ejecutado = 0`;
    } else if (qv === 0) {
      ejecutadoAutoriza = Prisma.sql`AND cd.autorizado = 1`;
    }
  } else if (qv !== 0) {
    ejecutadoAutoriza = Prisma.sql`AND cd.ejecutado = 0`;
  }

  return { visualizacion, ejecutadoAutoriza };
}

function subsistemaInClause(
  subsistemas: string | null | undefined,
  idCotizacion: number,
  column: string,
): Prisma.Sql {
  if (subsistemas != null && subsistemas.trim() !== '') {
    const ids = parseSubsistemaIds(subsistemas);
    if (ids.length === 0) {
      return Prisma.sql`1 = 0`;
    }
    return Prisma.sql`${Prisma.raw(column)} IN (${Prisma.join(ids)})`;
  }
  return Prisma.sql`${Prisma.raw(column)} IN (
    SELECT DISTINCT id_subsistema
    FROM postv_mpvi_cotizacion_detallada
    WHERE id_cotizacion = ${idCotizacion}
  )`;
}

@Injectable()
export class MpviCotizacionPrismaRepository implements IMpviCotizacionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSubsistemasByVh(placa: string): Promise<SubsistemaByVhRow[]> {
    return this.prisma.$queryRaw<SubsistemaByVhRow[]>`
      SELECT mo.id_subsistema AS id, s.subsistema
      FROM referencias_imp r
      INNER JOIN vh_modelo_ano ma ON r.id_modano = ma.id_modano
      INNER JOIN vh_modelo m ON ma.modelo = m.modelo
      INNER JOIN vh_familias f ON m.familia = f.familia
      INNER JOIN v_vh_vehiculos vh ON vh.placa = r.placa
      INNER JOIN postv_mpvi_vh v ON f.id = v.id_familia
        AND UPPER(LTRIM(RTRIM(v.clase))) = UPPER(LTRIM(RTRIM(vh.clase)))
      LEFT JOIN postv_mpvi_mano_obra mo ON v.id_vh = mo.id_vh
      INNER JOIN postv_mpvi_subsistemas s ON mo.id_subsistema = s.id_subsistema
      WHERE r.placa = ${placa}
      UNION
      SELECT mo.id_subsistema AS id, s.subsistema
      FROM referencias_imp r
      INNER JOIN vh_modelo_ano ma ON r.id_modano = ma.id_modano
      INNER JOIN vh_modelo m ON ma.modelo = m.modelo
      INNER JOIN vh_familias f ON m.familia = f.familia
      INNER JOIN v_vh_vehiculos vh ON vh.placa = r.placa
      INNER JOIN postv_mpvi_vh v ON f.id = v.id_familia
        AND UPPER(LTRIM(RTRIM(v.clase))) = UPPER(LTRIM(RTRIM(vh.clase)))
      LEFT JOIN postv_mpvi_repuestos mo ON v.id_vh = mo.id_vh
      INNER JOIN postv_mpvi_subsistemas s ON mo.id_subsistema = s.id_subsistema
      WHERE r.placa = ${placa}
      ORDER BY id ASC
    `;
  }

  async getDatosByPlaca(placa: string): Promise<DatosByPlacaRow | null> {
    const rows = await this.prisma.$queryRaw<DatosByPlacaRow[]>`
      SELECT nombres, celular, mail, rf.descripcion
      FROM referencias_imp r
      INNER JOIN terceros t ON r.nit_comprador = t.nit
      INNER JOIN referencias rf ON r.codigo = rf.codigo
      WHERE r.placa = ${placa}
    `;
    return rows[0] ?? null;
  }

  async getValorManoObra(
    bod: number,
    placa: string,
    subsistemas: string,
  ): Promise<ValorManoObraRow[]> {
    const ids = parseSubsistemaIds(subsistemas);
    if (ids.length === 0) return [];

    const rows = await this.prisma.$queryRaw<ValorManoObraRow[]>`
      SELECT DISTINCT v.id_vh, mo.id_subsistema, s.subsistema, mo.id_tempario, tt.operacion, tt.descripcion, mo.tiempo,
        valor = ISNULL(ISNULL(fc.valor_mano_obra, tf.valor_hora), (SELECT valor_hora FROM tall_tarifas_taller WHERE bodega = ${bod})),
        total = CONVERT(INT, (mo.tiempo * (ISNULL(ISNULL(fc.valor_mano_obra, tf.valor_hora), (SELECT valor_hora FROM tall_tarifas_taller WHERE bodega = 1)))
          + mo.tiempo * (ISNULL(ISNULL(fc.valor_mano_obra, tf.valor_hora), (SELECT valor_hora FROM tall_tarifas_taller WHERE bodega = ${bod})) * 0.19)))
      FROM referencias_imp r
      INNER JOIN vh_modelo_ano ma ON r.id_modano = ma.id_modano
      INNER JOIN vh_modelo m ON ma.modelo = m.modelo
      INNER JOIN vh_familias f ON m.familia = f.familia
      INNER JOIN v_vh_vehiculos vh ON vh.placa = r.placa
      INNER JOIN postv_mpvi_vh v ON f.id = v.id_familia
        AND UPPER(LTRIM(RTRIM(v.clase))) = UPPER(LTRIM(RTRIM(vh.clase)))
      LEFT JOIN postv_mpvi_mano_obra mo ON v.id_vh = mo.id_vh
      INNER JOIN postv_mpvi_subsistemas s ON mo.id_subsistema = s.id_subsistema
      INNER JOIN tall_tempario tt ON mo.id_tempario = tt.id
      LEFT JOIN flotas_intranet fi ON r.placa = fi.placa
      LEFT JOIN flotas_convenios fc ON fi.id_convenio = fc.id_convenio
      LEFT JOIN tall_tarifas_taller_nit tf ON r.nit_comprador = tf.nit
      WHERE r.placa = ${placa}
        AND ma.ano BETWEEN ano_inicial AND ISNULL(v.ano_final, YEAR(GETDATE()))
        AND mo.id_subsistema IN (${Prisma.join(ids)})
      ORDER BY mo.id_subsistema ASC
    `;
    return rows.map(normalizeManoObraRow);
  }

  async getValorRepuestos(
    bod: number,
    placa: string,
    subsistemas: string,
  ): Promise<ValorRepuestoRow[]> {
    const ids = parseSubsistemaIds(subsistemas);
    if (ids.length === 0) return [];

    const rows = await this.prisma.$queryRaw<ValorRepuestoRow[]>`
      SELECT id_vh, id_subsistema, subsistema, rb.codigo, tt.descripcion, rb.cantidad, ISNULL(disp, 0) AS disp,
        valor = pr.precio_1,
        descuento = ISNULL(ISNULL(fc.porc_desc_reptos, tf.descuento_fijo), 0),
        total = CONVERT(INT, (rb.cantidad * pr.precio_1 - (rb.cantidad * pr.precio_1 * ISNULL(ISNULL(fc.porc_desc_reptos, tf.descuento_fijo), 0) / 100))
          + ((rb.cantidad * pr.precio_1 - (rb.cantidad * pr.precio_1 * ISNULL(ISNULL(fc.porc_desc_reptos, tf.descuento_fijo), 0) / 100)) * 0.19))
      FROM (
        SELECT v.id_vh, s.id_subsistema, s.subsistema, rp.cantidad, r.placa, r.nit_comprador,
          codigo = CASE
            WHEN ISNULL(st.stock, 0) > 0 THEN rp.codigo
            WHEN ISNULL(st.stock, 0) = 0 AND alterno1 IS NOT NULL AND ISNULL(st1.stock, 0) > 0 THEN alt.alterno1
            WHEN ISNULL(st.stock, 0) = 0 AND alterno2 IS NOT NULL AND ISNULL(st1.stock, 0) = 0 AND ISNULL(st2.stock, 0) > 0 THEN alt.alterno2
            WHEN ISNULL(st.stock, 0) = 0 AND alterno3 IS NOT NULL AND ISNULL(st1.stock, 0) = 0 AND ISNULL(st2.stock, 0) = 0 AND ISNULL(st3.stock, 0) > 0 THEN alt.alterno3
            ELSE rp.codigo
          END,
          disp = CASE
            WHEN ISNULL(st.stock, 0) > 0 THEN st.stock
            WHEN ISNULL(st.stock, 0) = 0 AND alterno1 IS NOT NULL AND ISNULL(st1.stock, 0) > 0 THEN st1.stock
            WHEN ISNULL(st.stock, 0) = 0 AND alterno2 IS NOT NULL AND ISNULL(st1.stock, 0) = 0 AND ISNULL(st2.stock, 0) > 0 THEN st2.stock
            WHEN ISNULL(st.stock, 0) = 0 AND alterno3 IS NOT NULL AND ISNULL(st1.stock, 0) = 0 AND ISNULL(st2.stock, 0) = 0 AND ISNULL(st3.stock, 0) > 0 THEN st3.stock
            ELSE st.stock
          END
        FROM referencias_imp r
        INNER JOIN vh_modelo_ano ma ON r.id_modano = ma.id_modano
        INNER JOIN vh_modelo m ON ma.modelo = m.modelo
        INNER JOIN vh_familias f ON m.familia = f.familia
        INNER JOIN v_vh_vehiculos vh ON vh.placa = r.placa
        INNER JOIN postv_mpvi_vh v ON f.id = v.id_familia
          AND UPPER(LTRIM(RTRIM(v.clase))) = UPPER(LTRIM(RTRIM(vh.clase)))
        LEFT JOIN (
          SELECT id_repuesto, id_subsistema, id_vh, cantidad,
            codigo = CASE WHEN r2.alterno IS NULL THEN r1.codigo ELSE r2.codigo END
          FROM postv_mpvi_repuestos r1
          LEFT JOIN referencias_alt r2 ON r1.codigo = r2.alterno
        ) rp ON v.id_vh = rp.id_vh
        INNER JOIN postv_mpvi_subsistemas s ON rp.id_subsistema = s.id_subsistema
        LEFT JOIN (SELECT codigo, stock FROM v_referencias_sto_hoy WHERE bodega = ${bod}) st ON rp.codigo = st.codigo
        LEFT JOIN postv_mpvi_referencias alt ON rp.id_repuesto = alt.id_repuesto
        LEFT JOIN (SELECT codigo, stock FROM v_referencias_sto_hoy WHERE bodega = ${bod}) st1 ON alt.alterno1 = st1.codigo
        LEFT JOIN (SELECT codigo, stock FROM v_referencias_sto_hoy WHERE bodega = ${bod}) st2 ON alt.alterno2 = st2.codigo
        LEFT JOIN (SELECT codigo, stock FROM v_referencias_sto_hoy WHERE bodega = ${bod}) st3 ON alt.alterno3 = st3.codigo
        WHERE r.placa = ${placa}
          AND ma.ano BETWEEN ano_inicial AND ISNULL(v.ano_final, YEAR(GETDATE()))
      ) rb
      LEFT JOIN referencias tt ON rb.codigo = tt.codigo
      LEFT JOIN referencias_pre pr ON rb.codigo = pr.codigo
      LEFT JOIN flotas_intranet fi ON rb.placa = fi.placa
      LEFT JOIN flotas_convenios fc ON fi.id_convenio = fc.id_convenio
      LEFT JOIN terceros tf ON rb.nit_comprador = tf.nit
      WHERE id_subsistema IN (${Prisma.join(ids)})
      ORDER BY id_subsistema ASC
    `;
    return rows.map(normalizeRepuestoRow);
  }

  async getStockRepuesto(codRepuesto: string): Promise<StockRepuestoRow[]> {
    return this.prisma.$queryRaw<StockRepuestoRow[]>`
      SELECT b.descripcion AS sede, stock
      FROM v_referencias_sto_hoy st
      INNER JOIN bodegas b ON st.bodega = b.bodega
      WHERE st.bodega IN (1, 6, 7, 8, 23, 4)
        AND codigo = ${codRepuesto}
    `;
  }

  async guardarCotizacionMpvi(
    placa: string,
    bod: number,
    nombre: string,
    celular: string,
    correo: string,
    totalCotizacion: number,
    totalAutorizado: number,
    nota: string,
    diasProxContacto: string | number,
    numOrden: string,
  ): Promise<number | null> {
    const notaVal = nota.trim() !== '' ? nota : null;
    const diasVal =
      diasProxContacto !== '' && diasProxContacto != null
        ? Number(diasProxContacto)
        : null;

    const rows = await this.prisma.$queryRaw<{ id: number }[]>`
      INSERT INTO postv_mpvi_cotizacion (
        placa, bod, num_orden, nombre, celular, correo,
        total_cotizado, total_autorizado, nota, dias_prox_contacto
      )
      OUTPUT INSERTED.id
      VALUES (
        ${placa}, ${bod}, ${numOrden}, ${nombre}, ${celular}, ${correo},
        ${totalCotizacion}, ${totalAutorizado}, ${notaVal}, ${diasVal}
      )
    `;
    return rows[0]?.id != null ? Number(rows[0].id) : null;
  }

  async guardarCotizacionMpviDetalle(
    data: CotizacionDetalleInsert[],
  ): Promise<number> {
    if (data.length === 0) return 0;

    const tuples = data.map(
      (row) => Prisma.sql`(
        ${row.id_cotizacion}, ${row.id_subsistema}, ${row.operacion}, ${row.tipo},
        ${row.tipo_item}, ${row.cantidadTiempo}, ${row.autorizado}, ${row.usuario_auth},
        ${row.disponible}, ${row.ejecutado ?? 0}, ${row.valor}
      )`,
    );

    const affected = await this.prisma.$executeRaw`
      INSERT INTO postv_mpvi_cotizacion_detallada (
        id_cotizacion, id_subsistema, operacion, tipo, tipo_item,
        cantidadTiempo, autorizado, usuario_auth, disponible, ejecutado, valor
      ) VALUES ${Prisma.join(tuples)}
    `;
    return Number(affected);
  }

  async guardarCotizacionMpviLog(
    idCotizacion: number,
    operacion: string,
    idUser: number,
    op: number,
    autorizado?: string | number | null,
  ): Promise<boolean> {
    const acciones = [
      'Creación de la cotización',
      `El usuario cambió el estado a ${autorizado ?? ''}`,
    ];
    const accion = acciones[op] ?? acciones[0];

    try {
      await this.prisma.$executeRaw`
        INSERT INTO postv_mpvi_cotizacion_log (id_cotizacion, operacion, usuario_reg, accion)
        VALUES (${idCotizacion}, ${operacion}, ${idUser}, ${accion})
      `;
      return true;
    } catch {
      return false;
    }
  }

  async getEncabezado(
    idCotizacion: number,
  ): Promise<CotizacionEncabezadoRow[]> {
    const rows = await this.prisma.$queryRaw<CotizacionEncabezadoRow[]>`
      SELECT c.*,
        CONVERT(VARCHAR, c.fecha_reg, 103) AS fecha,
        b.descripcion AS nom_bodega,
        b.direccion,
        b.telefono
      FROM postv_mpvi_cotizacion c
      LEFT JOIN bodegas b ON b.bodega = c.bod
      WHERE c.id = ${idCotizacion}
    `;
    return rows.map((row) => ({
      ...row,
      id: toJsNumber(row.id),
      bod: toJsNumber(row.bod),
      total_cotizado: toJsNumber(row.total_cotizado),
      total_autorizado: toJsNumber(row.total_autorizado),
      dias_prox_contacto:
        row.dias_prox_contacto != null
          ? toJsNumber(row.dias_prox_contacto)
          : row.dias_prox_contacto,
    }));
  }

  async getDisponibilidadItems(
    idCotizacion: number,
  ): Promise<DisponibilidadItemRow[]> {
    return this.prisma.$queryRaw<DisponibilidadItemRow[]>`
      SELECT disponible
      FROM postv_mpvi_cotizacion_detallada
      WHERE id_cotizacion = ${idCotizacion}
    `;
  }

  async actualizarCotizacionMpvi(
    idCotizacion: number,
    totalAutorizado: number,
    nota: string,
    diasProxContacto: string | number,
    totalCotizacion?: number | null,
  ): Promise<boolean> {
    try {
      if (totalCotizacion != null) {
        await this.prisma.$executeRaw`
          UPDATE postv_mpvi_cotizacion
          SET total_autorizado = ${totalAutorizado},
              nota = ${nota},
              dias_prox_contacto = ${diasProxContacto},
              total_cotizado = ${totalCotizacion}
          WHERE id = ${idCotizacion}
        `;
      } else {
        await this.prisma.$executeRaw`
          UPDATE postv_mpvi_cotizacion
          SET total_autorizado = ${totalAutorizado},
              nota = ${nota},
              dias_prox_contacto = ${diasProxContacto}
          WHERE id = ${idCotizacion}
        `;
      }
      return true;
    } catch {
      return false;
    }
  }

  async actualizarCotizacionMpviDetallada(
    idCotizacion: number,
    idSubsistema: number,
    operacion: string,
    disponibilidad: string,
    idUser: number,
    autorizado: number,
  ): Promise<boolean> {
    try {
      await this.prisma.$executeRaw`
        UPDATE postv_mpvi_cotizacion_detallada
        SET autorizado = ${autorizado},
            disponible = ${disponibilidad},
            usuario_auth = ${idUser}
        WHERE id_cotizacion = ${idCotizacion}
          AND id_subsistema = ${idSubsistema}
          AND operacion = ${operacion}
      `;
      return true;
    } catch {
      return false;
    }
  }

  async actualizarCotizacionMpviDetalladaEjecutada(
    idCotizacion: number,
    idSubsistema: number,
    operacion: string,
    disponibilidad: string,
    opFecha: boolean | null,
    ejecutado: number,
  ): Promise<boolean> {
    try {
      if (opFecha != null) {
        await this.prisma.$executeRaw`
          UPDATE postv_mpvi_cotizacion_detallada
          SET disponible = ${disponibilidad},
              ejecutado = ${ejecutado},
              fecha_disp = CONVERT(DATE, GETDATE())
          WHERE id_cotizacion = ${idCotizacion}
            AND id_subsistema = ${idSubsistema}
            AND operacion = ${operacion}
        `;
      } else {
        await this.prisma.$executeRaw`
          UPDATE postv_mpvi_cotizacion_detallada
          SET disponible = ${disponibilidad},
              ejecutado = ${ejecutado}
          WHERE id_cotizacion = ${idCotizacion}
            AND id_subsistema = ${idSubsistema}
            AND operacion = ${operacion}
        `;
      }
      return true;
    } catch {
      return false;
    }
  }

  async descartarCotizacion(idCotizacion: number): Promise<boolean> {
    try {
      await this.prisma.$executeRaw`
        UPDATE postv_mpvi_cotizacion
        SET descartado = 1
        WHERE id = ${idCotizacion}
      `;
      return true;
    } catch {
      return false;
    }
  }

  async getValorManoObraPdf(
    bod: number,
    placa: string,
    idCotizacion: number,
    tipoItem: string,
    quienVisualiza: number | string = '',
    subsistemas: string | null = null,
    esPDF: boolean | null = null,
    pdfGestion: boolean | number = false,
  ): Promise<ValorManoObraPdfRow[]> {
    const { visualizacion, ejecutadoAutoriza } = buildPdfFilterFragments(
      quienVisualiza,
      esPDF,
      pdfGestion,
    );
    const subsistemaFilter = subsistemaInClause(
      subsistemas,
      idCotizacion,
      'mo.id_subsistema',
    );

    return this.prisma.$queryRaw<ValorManoObraPdfRow[]>`
      SELECT v.id_vh, mo.id_subsistema, s.subsistema, mo.id_tempario, tt.operacion, tt.descripcion, mo.tiempo,
        cd.valor, cd.autorizado, cd.disponible, u.perfil_postventa
      FROM referencias_imp r
      INNER JOIN vh_modelo_ano ma ON r.id_modano = ma.id_modano
      INNER JOIN vh_modelo m ON ma.modelo = m.modelo
      INNER JOIN vh_familias f ON m.familia = f.familia
      INNER JOIN v_vh_vehiculos vh ON vh.placa = r.placa
      INNER JOIN postv_mpvi_vh v ON f.id = v.id_familia
        AND UPPER(LTRIM(RTRIM(v.clase))) = UPPER(LTRIM(RTRIM(vh.clase)))
      LEFT JOIN postv_mpvi_mano_obra mo ON v.id_vh = mo.id_vh
      INNER JOIN postv_mpvi_subsistemas s ON mo.id_subsistema = s.id_subsistema
      INNER JOIN tall_tempario tt ON mo.id_tempario = tt.id
      LEFT JOIN flotas_intranet fi ON r.placa = fi.placa
      INNER JOIN postv_mpvi_cotizacion_detallada cd ON cd.id_subsistema = s.id_subsistema
      INNER JOIN w_sist_usuarios u ON u.id_usuario = cd.usuario_auth
      WHERE r.placa = ${placa}
        AND ma.ano BETWEEN ano_inicial AND ISNULL(v.ano_final, YEAR(GETDATE()))
        AND ${subsistemaFilter}
        AND cd.id_cotizacion = ${idCotizacion}
        AND cd.tipo_item = ${tipoItem}
        AND cd.tipo = 'T'
        ${visualizacion}
        ${ejecutadoAutoriza}
      ORDER BY mo.id_subsistema ASC
    `;
  }

  async getValorRepuestosPdf(
    bod: number,
    placa: string,
    idCotizacion: number,
    tipoItem: string,
    quienVisualiza: number | string = '',
    subsistemas: string | null = null,
    esPDF: boolean | null = null,
    pdfGestion: boolean | number = false,
  ): Promise<ValorRepuestoPdfRow[]> {
    const { visualizacion, ejecutadoAutoriza } = buildPdfFilterFragments(
      quienVisualiza,
      esPDF,
      pdfGestion,
    );
    const subsistemaFilter = subsistemaInClause(
      subsistemas,
      idCotizacion,
      'rb.id_subsistema',
    );

    return this.prisma.$queryRaw<ValorRepuestoPdfRow[]>`
      SELECT id_vh, rb.id_subsistema, subsistema, rb.codigo, tt.descripcion, rb.cantidad,
        cd.valor, cd.autorizado, cd.disponible, u.perfil_postventa
      FROM (
        SELECT v.id_vh, s.id_subsistema, s.subsistema, rp.cantidad, r.placa, r.nit_comprador,
          codigo = CASE
            WHEN ISNULL(st.stock, 0) > 0 THEN rp.codigo
            WHEN ISNULL(st.stock, 0) = 0 AND alterno1 IS NOT NULL AND ISNULL(st1.stock, 0) > 0 THEN alt.alterno1
            WHEN ISNULL(st.stock, 0) = 0 AND alterno2 IS NOT NULL AND ISNULL(st1.stock, 0) = 0 AND ISNULL(st2.stock, 0) > 0 THEN alt.alterno2
            WHEN ISNULL(st.stock, 0) = 0 AND alterno3 IS NOT NULL AND ISNULL(st1.stock, 0) = 0 AND ISNULL(st2.stock, 0) = 0 AND ISNULL(st3.stock, 0) > 0 THEN alt.alterno3
            ELSE rp.codigo
          END
        FROM referencias_imp r
        INNER JOIN vh_modelo_ano ma ON r.id_modano = ma.id_modano
        INNER JOIN vh_modelo m ON ma.modelo = m.modelo
        INNER JOIN vh_familias f ON m.familia = f.familia
        INNER JOIN v_vh_vehiculos vh ON vh.placa = r.placa
        INNER JOIN postv_mpvi_vh v ON f.id = v.id_familia
          AND UPPER(LTRIM(RTRIM(v.clase))) = UPPER(LTRIM(RTRIM(vh.clase)))
        LEFT JOIN (
          SELECT id_repuesto, id_subsistema, id_vh, cantidad,
            codigo = CASE WHEN r2.alterno IS NULL THEN r1.codigo ELSE r2.codigo END
          FROM postv_mpvi_repuestos r1
          LEFT JOIN referencias_alt r2 ON r1.codigo = r2.alterno
        ) rp ON v.id_vh = rp.id_vh
        INNER JOIN postv_mpvi_subsistemas s ON rp.id_subsistema = s.id_subsistema
        LEFT JOIN (SELECT codigo, stock FROM v_referencias_sto_hoy WHERE bodega = ${bod}) st ON rp.codigo = st.codigo
        LEFT JOIN postv_mpvi_referencias alt ON rp.id_repuesto = alt.id_repuesto
        LEFT JOIN (SELECT codigo, stock FROM v_referencias_sto_hoy WHERE bodega = ${bod}) st1 ON alt.alterno1 = st1.codigo
        LEFT JOIN (SELECT codigo, stock FROM v_referencias_sto_hoy WHERE bodega = ${bod}) st2 ON alt.alterno2 = st2.codigo
        LEFT JOIN (SELECT codigo, stock FROM v_referencias_sto_hoy WHERE bodega = ${bod}) st3 ON alt.alterno3 = st3.codigo
        WHERE r.placa = ${placa}
          AND ma.ano BETWEEN ano_inicial AND ISNULL(v.ano_final, YEAR(GETDATE()))
      ) rb
      LEFT JOIN referencias tt ON rb.codigo = tt.codigo
      INNER JOIN postv_mpvi_cotizacion_detallada cd ON cd.id_subsistema = rb.id_subsistema
      INNER JOIN w_sist_usuarios u ON u.id_usuario = cd.usuario_auth
      WHERE ${subsistemaFilter}
        AND cd.id_cotizacion = ${idCotizacion}
        AND cd.tipo_item = ${tipoItem}
        AND cd.tipo = 'R'
        ${visualizacion}
        ${ejecutadoAutoriza}
      ORDER BY rb.id_subsistema ASC
    `;
  }

  async getCotizacionContact(
    placa?: string | null,
  ): Promise<CotizacionContactRow[]> {
    if (placa) {
      return this.prisma.$queryRaw<CotizacionContactRow[]>`
        SELECT c.*,
          fecha_contacto = DATEADD(DAY, ISNULL(c.dias_prox_contacto, 0), CONVERT(DATE, log_max.max_fecha_reg)),
          dias_restantes = DATEDIFF(DAY, GETDATE(), DATEADD(DAY, ISNULL(c.dias_prox_contacto, 0), CONVERT(DATE, log_max.max_fecha_reg)))
        FROM postv_mpvi_cotizacion c
        INNER JOIN (
          SELECT id_cotizacion, MAX(fecha_reg) AS max_fecha_reg
          FROM postv_mpvi_cotizacion_log
          GROUP BY id_cotizacion
        ) AS log_max ON log_max.id_cotizacion = c.id
        INNER JOIN (
          SELECT DISTINCT id_cotizacion
          FROM postv_mpvi_cotizacion_detallada
          WHERE ejecutado = 1
        ) cd ON cd.id_cotizacion = c.id
        WHERE ISNULL(c.descartado, 0) <> 1
          AND c.total_cotizado <> c.total_autorizado
          AND c.placa = ${placa}
          AND DATEDIFF(DAY, GETDATE(), DATEADD(DAY, ISNULL(c.dias_prox_contacto, 0), CONVERT(DATE, log_max.max_fecha_reg))) BETWEEN 0 AND 8
      `;
    }

    return this.prisma.$queryRaw<CotizacionContactRow[]>`
      SELECT c.*,
        fecha_contacto = DATEADD(DAY, ISNULL(c.dias_prox_contacto, 0), CONVERT(DATE, log_max.max_fecha_reg)),
        dias_restantes = DATEDIFF(DAY, GETDATE(), DATEADD(DAY, ISNULL(c.dias_prox_contacto, 0), CONVERT(DATE, log_max.max_fecha_reg)))
      FROM postv_mpvi_cotizacion c
      INNER JOIN (
        SELECT id_cotizacion, MAX(fecha_reg) AS max_fecha_reg
        FROM postv_mpvi_cotizacion_log
        GROUP BY id_cotizacion
      ) AS log_max ON log_max.id_cotizacion = c.id
      INNER JOIN (
        SELECT DISTINCT id_cotizacion
        FROM postv_mpvi_cotizacion_detallada
        WHERE ejecutado = 1
      ) cd ON cd.id_cotizacion = c.id
      WHERE ISNULL(c.descartado, 0) <> 1
        AND c.total_cotizado <> c.total_autorizado
        AND DATEDIFF(DAY, GETDATE(), DATEADD(DAY, ISNULL(c.dias_prox_contacto, 0), CONVERT(DATE, log_max.max_fecha_reg))) BETWEEN 0 AND 8
    `;
  }

  async getCreadorCotizacion(
    idCotizacion: number,
  ): Promise<CreadorCotizacionRow | null> {
    const rows = await this.prisma.$queryRaw<CreadorCotizacionRow[]>`
      SELECT t.nombres
      FROM postv_mpvi_cotizacion_log l
      INNER JOIN w_sist_usuarios u ON u.id_usuario = l.usuario_reg
      INNER JOIN terceros t ON t.nit = u.nit_usuario
      WHERE l.id_cotizacion = ${idCotizacion}
        AND l.operacion = 'creación'
    `;
    return rows[0] ?? null;
  }

  async validarExisteFirma(
    idCotizacion: number,
  ): Promise<CotizacionFirmaRow | null> {
    const rows = await this.prisma.$queryRaw<CotizacionFirmaRow[]>`
      SELECT * FROM postv_mpvi_cotizacion_firmas
      WHERE id_cotizacion = ${idCotizacion}
    `;
    return rows[0] ?? null;
  }

  async guardarRegistroFirma(
    data: Record<string, unknown>,
  ): Promise<number | null> {
    const idCotizacion = Number(data.id_cotizacion);
    const opcion = Number(data.opcion ?? data.op ?? 0);

    const entries = Object.entries(data).filter(
      ([key, value]) =>
        value !== '' &&
        value != null &&
        !['id_cotizacion', 'opcion', 'op'].includes(key) &&
        /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key),
    );

    if (entries.length === 0) {
      const rows = await this.prisma.$queryRaw<{ id: number }[]>`
        INSERT INTO postv_mpvi_cotizacion_firmas (id_cotizacion, opcion)
        OUTPUT INSERTED.id
        VALUES (${idCotizacion}, ${opcion})
      `;
      return rows[0]?.id ?? null;
    }

    const columns = ['id_cotizacion', 'opcion', ...entries.map(([k]) => k)];
    const values = [idCotizacion, opcion, ...entries.map(([, v]) => v)];

    const rows = await this.prisma.$queryRaw<{ id: number }[]>`
      INSERT INTO postv_mpvi_cotizacion_firmas (${Prisma.raw(columns.join(', '))})
      OUTPUT INSERTED.id
      VALUES (${Prisma.join(values)})
    `;
    return rows[0]?.id ?? null;
  }
}
