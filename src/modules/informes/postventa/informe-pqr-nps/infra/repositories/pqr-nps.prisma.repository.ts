import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import {
  ActualizarPqrNpsPayload,
  CrearPqrPayload,
  CrearVerbalizacionPayload,
  FiltrosPqrNps,
  IPqrNpsRepository,
} from '../../domain/pqr-nps.repository';
import {
  PqrNpsGestionEntity,
  PqrNpsItemEntity,
  PqrNpsTecnicoEntity,
  PqrNpsVehiculoInfoEntity,
  PqrNpsVerbalizacionEntity,
} from '../../domain/pqr-nps.entity';

@Injectable()
export class PqrNpsPrismaRepository implements IPqrNpsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(filtros: FiltrosPqrNps): Promise<PqrNpsItemEntity[]> {
    const estado = filtros.estado ?? 'abiertos';

    const gmSql = this.buildEncuestasGmSql(estado);
    const codSql = this.buildPqrCodieselSql(estado);
    const codiSql = this.buildEncuestasCodiSql(estado);
    const qrSql = this.buildEncuestaQrSql(estado);

    const unionSql = Prisma.sql`
      ${gmSql}
      UNION ALL
      ${codSql}
      UNION ALL
      ${codiSql}
      UNION ALL
      ${qrSql}
      ORDER BY fecha DESC
    `;

    const rows = await this.prisma.$queryRaw<
      {
        fuente: string;
        id: number;
        pqr_nps_id: number | null;
        sede: string;
        area: string;
        fecha: string;
        placa: string;
        cliente: string;
        modelo_vh: string;
        orden: string;
        mail: string;
        telefono: string;
        servicio: string | null;
        satisfaccion_concesionario: string | null;
        satisfaccion_trabajo: string | null;
        vh_reparado_ok: string | null;
        recomendacion_marca: string | null;
        comentarios: string | null;
        tecnico: string;
        tipificacion_encuesta: string | null;
        contacto_cliente: string | null;
        estado_caso: string | null;
        comentarios_final_caso: string | null;
        tipificacion_cierre: string | null;
      }[]
    >(unionSql);

    return rows.map(
      (r) =>
        new PqrNpsItemEntity({
          fuente: r.fuente,
          id: r.id,
          pqrNpsId: r.pqr_nps_id,
          sede: r.sede,
          area: r.area,
          fecha: r.fecha,
          placa: r.placa,
          cliente: r.cliente,
          modeloVh: r.modelo_vh,
          orden: r.orden,
          mail: r.mail,
          telefono: r.telefono,
          servicio: r.servicio,
          satisfaccionConcesionario: r.satisfaccion_concesionario,
          satisfaccionTrabajo: r.satisfaccion_trabajo,
          vhReparadoOk: r.vh_reparado_ok,
          recomendacionMarca: r.recomendacion_marca,
          comentarios: r.comentarios,
          tecnico: r.tecnico,
          tipificacionEncuesta: r.tipificacion_encuesta,
          contactoCliente: r.contacto_cliente,
          estadoCaso: r.estado_caso,
          comentariosFinalCaso: r.comentarios_final_caso,
          tipificacionCierre: r.tipificacion_cierre,
        }),
    );
  }

  async obtenerGestion(
    fuente: string,
    idFuente: number,
  ): Promise<PqrNpsGestionEntity | null> {
    const rows = await this.prisma.$queryRaw<
      {
        id: number;
        post_venta: number;
        fuente: string;
        estado_caso: string;
        tipificacion_encuesta: string;
        tipificacion_cierre: string;
        comentarios_final_caso: string;
      }[]
    >`
      SELECT TOP 1 id, post_venta, fuente, estado_caso, tipificacion_encuesta, tipificacion_cierre, comentarios_final_caso
      FROM postv_pqr_nps
      WHERE fuente = ${fuente} AND id_fuente = ${idFuente}
    `;

    if (rows.length === 0) return null;

    return new PqrNpsGestionEntity({
      id: rows[0].id,
      postVenta: rows[0].post_venta,
      fuente: rows[0].fuente,
      estadoCaso: rows[0].estado_caso,
      tipificacionEncuesta: rows[0].tipificacion_encuesta,
      tipificacionCierre: rows[0].tipificacion_cierre,
      comentariosFinalCaso: rows[0].comentarios_final_caso,
    });
  }

  async guardarGestion(payload: ActualizarPqrNpsPayload): Promise<void> {
    const rows = await this.prisma.$queryRaw<{ id: number }[]>`
      SELECT TOP 1 id
      FROM postv_pqr_nps
      WHERE fuente = ${payload.fuente} AND id_fuente = ${payload.idFuente}
    `;

    if (rows.length > 0) {
      await this.prisma.$executeRaw`
        UPDATE postv_pqr_nps
        SET post_venta = ${payload.postVenta},
            tecnico = COALESCE(TRY_CONVERT(BIGINT, ${payload.tecnico}), tecnico),
            tipificacion_encuesta = ${payload.tipificacionEncuesta},
            estado_caso = ${payload.estadoCaso},
            comentarios_final_caso = ${payload.comentariosFinalCaso},
            tipificacion_cierre = ${payload.tipificacionCierre}
        WHERE id = ${rows[0].id}
      `;
      return;
    }

    await this.prisma.$executeRaw`
      INSERT INTO postv_pqr_nps (post_venta, fuente, id_fuente, tecnico, tipificacion_encuesta, estado_caso, comentarios_final_caso, tipificacion_cierre)
      VALUES (${payload.postVenta}, ${payload.fuente}, ${payload.idFuente}, TRY_CONVERT(BIGINT, ${payload.tecnico}), ${payload.tipificacionEncuesta}, ${payload.estadoCaso}, ${payload.comentariosFinalCaso}, ${payload.tipificacionCierre})
    `;
  }

  async crearPqr(payload: CrearPqrPayload): Promise<void> {
    await this.prisma.$executeRaw`
      INSERT INTO postv_pqr (fuente, sede, fecha, placa, cliente, modelo_vh, ot, mail, telef, tecnico, comentarios)
      VALUES (${payload.fuente}, ${payload.sede}, ${payload.fecha}, ${payload.placa}, ${payload.cliente}, ${payload.modeloVh}, ${payload.orden}, ${payload.mail}, ${payload.telefono}, ${payload.tecnico}, ${payload.comentarios})
    `;
  }

  async obtenerClientePorNit(nit: string): Promise<string | null> {
    const rows = await this.prisma.$queryRaw<{ nombres: string }[]>`
      SELECT TOP 1 nombres FROM terceros WHERE nit = ${nit}
    `;
    return rows[0]?.nombres ?? null;
  }

  async obtenerInfoVehiculo(
    placa: string,
  ): Promise<PqrNpsVehiculoInfoEntity | null> {
    const rows = await this.prisma.$queryRaw<
      {
        serie: string;
        descripcion: string;
        nombres: string;
        nit_comprador: string;
        mail: string;
        celular: string;
      }[]
    >`
      SELECT TOP 1
        vhv.serie,
        vhv.descripcion,
        t.nombres,
        vhv.nit_comprador,
        t.mail,
        t.celular
      FROM v_vh_vehiculos vhv
      INNER JOIN tall_encabeza_orden teo ON vhv.codigo = teo.serie
      INNER JOIN terceros t ON t.nit = vhv.nit_comprador
      WHERE vhv.placa = ${placa}
    `;

    if (rows.length === 0) return null;
    return new PqrNpsVehiculoInfoEntity({
      serie: rows[0].serie,
      modelo: rows[0].descripcion,
      nombres: rows[0].nombres,
      nit: rows[0].nit_comprador,
      mail: rows[0].mail,
      celular: rows[0].celular,
    });
  }

  async crearVerbalizacion(payload: CrearVerbalizacionPayload): Promise<void> {
    await this.prisma.$executeRaw`
      INSERT INTO postv_pqr_comentarios (id_pqr_nps, contacto, verbalizacion, fecha_contacto)
      VALUES (${payload.idPqrNps}, ${payload.contacto}, ${payload.verbalizacion}, GETDATE())
    `;
  }

  async listarVerbalizaciones(
    idPqrNps: number,
  ): Promise<PqrNpsVerbalizacionEntity[]> {
    const rows = await this.prisma.$queryRaw<
      {
        contacto: string;
        verbalizacion: string;
        fecha_contacto: Date;
      }[]
    >`
      SELECT contacto, verbalizacion, fecha_contacto
      FROM postv_pqr_comentarios
      WHERE id_pqr_nps = ${idPqrNps}
      ORDER BY fecha_contacto DESC
    `;

    return rows.map(
      (row) =>
        new PqrNpsVerbalizacionEntity({
          contacto: row.contacto,
          verbalizacion: row.verbalizacion,
          fechaContacto:
            row.fecha_contacto instanceof Date
              ? row.fecha_contacto.toISOString()
              : String(row.fecha_contacto),
        }),
    );
  }

  async listarTecnicos(): Promise<PqrNpsTecnicoEntity[]> {
    const rows = await this.prisma.$queryRaw<
      { documento: string; nombre: string }[]
    >`
      SELECT t.nit AS documento, t.nombres AS nombre
      FROM tall_operarios t_o
      INNER JOIN terceros t ON t.nit = t_o.nit
      WHERE LEN(t.nit) > 5
      UNION
      SELECT va.vendedor AS documento, va.nombres AS nombre
      FROM v_asesores_vh va
      WHERE va.trabaja_act = 1
    `;

    return rows.map(
      (row) =>
        new PqrNpsTecnicoEntity({
          documento: row.documento,
          nombre: row.nombre,
        }),
    );
  }

  private buildEncuestasGmSql(
    estado: 'abiertos' | 'cerrados' | 'todos',
  ): Prisma.Sql {
    if (estado !== 'cerrados') {
      return Prisma.sql`
        SELECT
          'GM' AS fuente,
          pgm.id_encuesta AS id,
          qn.id AS pqr_nps_id,
          b.descripcion AS sede,
          CASE WHEN qn.post_venta = 1 THEN 'POSTVENTA' WHEN qn.post_venta = 2 THEN 'VENTAS' ELSE '' END AS area,
          CONVERT(VARCHAR, pgm.fecha_evento, 23) AS fecha,
          vhv.placa,
          t.nombres AS cliente,
          vhv.descripcion AS modelo_vh,
          ut.uetd_numero AS orden,
          t.mail,
          t.celular AS telefono,
          CAST(pgm.recomendacion_concesionario AS VARCHAR(20)) AS servicio,
          CAST(pgm.satisfaccion_concesionario AS VARCHAR(20)) AS satisfaccion_concesionario,
          CAST(pgm.satisfaccion_trabajo AS VARCHAR(20)) AS satisfaccion_trabajo,
          CAST(pgm.vh_reparado_ok AS VARCHAR(20)) AS vh_reparado_ok,
          CAST(pgm.recomendacion_marca AS VARCHAR(20)) AS recomendacion_marca,
          pgm.comentarios,
          v.nombres AS tecnico,
          qn.tipificacion_encuesta,
          NULL AS contacto_cliente,
          qn.estado_caso,
          qn.comentarios_final_caso,
          qn.tipificacion_cierre
        FROM postv_encuestas_gm pgm
        INNER JOIN v_vh_vehiculos vhv ON pgm.VIN = vhv.serie
        INNER JOIN v_ultima_entrada_taller_datos ut ON ut.uetd_serie = vhv.codigo
        INNER JOIN tall_encabeza_orden teo ON teo.numero = ut.uetd_numero
        INNER JOIN terceros t ON t.nit = teo.nit
        INNER JOIN terceros v ON v.nit = teo.vendedor
        LEFT JOIN postv_pqr_nps qn ON qn.id_fuente = pgm.id_encuesta AND qn.fuente = pgm.fuente
        INNER JOIN bodegas b ON b.bodega = teo.bodega
        WHERE pgm.recomendacion_concesionario <= 8
          AND ${this.estadoClause('qn', estado)}
          AND pgm.fecha_evento >= '2023-11-01'
      `;
    }

    // cerrados
    return Prisma.sql`
      SELECT
        'GM' AS fuente,
        pgm.id_encuesta AS id,
        qn.id AS pqr_nps_id,
        b.descripcion AS sede,
        CASE WHEN qn.post_venta = 1 THEN 'POSTVENTA' WHEN qn.post_venta = 2 THEN 'VENTAS' ELSE '' END AS area,
        CONVERT(VARCHAR, pgm.fecha_evento, 23) AS fecha,
        vhv.placa,
        t.nombres AS cliente,
        vhv.descripcion AS modelo_vh,
        ut.uetd_numero AS orden,
        t.mail,
        t.celular AS telefono,
        CAST(pgm.recomendacion_concesionario AS VARCHAR(20)) AS servicio,
        CAST(pgm.satisfaccion_concesionario AS VARCHAR(20)) AS satisfaccion_concesionario,
        CAST(pgm.satisfaccion_trabajo AS VARCHAR(20)) AS satisfaccion_trabajo,
        CAST(pgm.vh_reparado_ok AS VARCHAR(20)) AS vh_reparado_ok,
        CAST(pgm.recomendacion_marca AS VARCHAR(20)) AS recomendacion_marca,
        pgm.comentarios,
        v.nombres AS tecnico,
        qn.tipificacion_encuesta,
        NULL AS contacto_cliente,
        qn.estado_caso,
        qn.comentarios_final_caso,
        qn.tipificacion_cierre
      FROM postv_encuestas_gm pgm
      INNER JOIN v_vh_vehiculos vhv ON pgm.VIN = vhv.serie
      INNER JOIN v_ultima_entrada_taller_datos ut ON ut.uetd_serie = vhv.codigo
      INNER JOIN tall_encabeza_orden teo ON teo.numero = ut.uetd_numero
      INNER JOIN terceros t ON t.nit = teo.nit
      INNER JOIN terceros v ON v.nit = teo.vendedor
      LEFT JOIN postv_pqr_nps qn ON qn.id_fuente = pgm.id_encuesta AND qn.fuente = pgm.fuente
      INNER JOIN bodegas b ON b.bodega = teo.bodega
      WHERE pgm.recomendacion_concesionario <= 8
        AND qn.estado_caso = 'Cerrado'
    `;
  }

  private buildPqrCodieselSql(
    estado: 'abiertos' | 'cerrados' | 'todos',
  ): Prisma.Sql {
    if (estado !== 'cerrados') {
      return Prisma.sql`
        SELECT
          pqr.fuente AS fuente,
          pqr.id_pqr AS id,
          ppqr.id AS pqr_nps_id,
          pqr.sede,
          CASE WHEN ppqr.post_venta = 1 THEN 'POSTVENTA' WHEN ppqr.post_venta = 2 THEN 'VENTAS' ELSE '' END AS area,
          CONVERT(VARCHAR, pqr.fecha, 23) AS fecha,
          pqr.placa,
          t.nombres AS cliente,
          pqr.modelo_vh AS modelo_vh,
          pqr.ot AS orden,
          t.mail,
          t.celular AS telefono,
          CAST(NULL AS VARCHAR(20)) AS servicio,
          CAST(NULL AS VARCHAR(20)) AS satisfaccion_concesionario,
          CAST(NULL AS VARCHAR(20)) AS satisfaccion_trabajo,
          CAST(NULL AS VARCHAR(20)) AS vh_reparado_ok,
          CAST(NULL AS VARCHAR(20)) AS recomendacion_marca,
          pqr.comentarios,
          tec.nombres AS tecnico,
          ppqr.tipificacion_encuesta,
          NULL AS contacto_cliente,
          ppqr.estado_caso,
          ppqr.comentarios_final_caso,
          ppqr.tipificacion_cierre
        FROM postv_pqr pqr
        INNER JOIN terceros t ON t.nit = pqr.cliente
        INNER JOIN terceros tec ON tec.nit = pqr.tecnico
        LEFT JOIN postv_pqr_nps ppqr ON pqr.id_pqr = ppqr.id_fuente AND pqr.fuente = ppqr.fuente
        WHERE ${this.estadoClause('ppqr', estado)}
      `;
    }

    return Prisma.sql`
      SELECT
        pqr.fuente AS fuente,
        pqr.id_pqr AS id,
        ppqr.id AS pqr_nps_id,
        pqr.sede,
        CASE WHEN ppqr.post_venta = 1 THEN 'POSTVENTA' WHEN ppqr.post_venta = 2 THEN 'VENTAS' ELSE '' END AS area,
        CONVERT(VARCHAR, pqr.fecha, 23) AS fecha,
        pqr.placa,
        t.nombres AS cliente,
        pqr.modelo_vh AS modelo_vh,
        pqr.ot AS orden,
        t.mail,
        t.celular AS telefono,
        CAST(NULL AS VARCHAR(20)) AS servicio,
        CAST(NULL AS VARCHAR(20)) AS satisfaccion_concesionario,
        CAST(NULL AS VARCHAR(20)) AS satisfaccion_trabajo,
        CAST(NULL AS VARCHAR(20)) AS vh_reparado_ok,
        CAST(NULL AS VARCHAR(20)) AS recomendacion_marca,
        pqr.comentarios,
        tec.nombres AS tecnico,
        ppqr.tipificacion_encuesta,
        NULL AS contacto_cliente,
        ppqr.estado_caso,
        ppqr.comentarios_final_caso,
        ppqr.tipificacion_cierre
      FROM postv_pqr pqr
      INNER JOIN terceros t ON t.nit = pqr.cliente
      INNER JOIN terceros tec ON tec.nit = pqr.tecnico
      LEFT JOIN postv_pqr_nps ppqr ON pqr.id_pqr = ppqr.id_fuente AND pqr.fuente = ppqr.fuente
      WHERE ppqr.estado_caso = 'Cerrado'
    `;
  }

  private buildEncuestasCodiSql(
    estado: 'abiertos' | 'cerrados' | 'todos',
  ): Prisma.Sql {
    if (estado !== 'cerrados') {
      return Prisma.sql`
        SELECT
          'CODI' AS fuente,
          pes.id AS id,
          ppqr.id AS pqr_nps_id,
          b.descripcion AS sede,
          CASE WHEN ppqr.post_venta = 1 THEN 'POSTVENTA' WHEN ppqr.post_venta = 2 THEN 'VENTAS' ELSE '' END AS area,
          CONVERT(VARCHAR, pes.fecha, 23) AS fecha,
          vhv.placa,
          t.nombres AS cliente,
          vhv.descripcion AS modelo_vh,
          pes.n_orden AS orden,
          t.mail,
          t.celular AS telefono,
          CAST(pes.pregunta1 AS VARCHAR(20)) AS servicio,
          CAST(pes.pregunta2 AS VARCHAR(20)) AS satisfaccion_concesionario,
          CAST(pes.pregunta3 AS VARCHAR(20)) AS satisfaccion_trabajo,
          CAST(pes.pregunta4 AS VARCHAR(20)) AS vh_reparado_ok,
          CAST(pes.pregunta5 AS VARCHAR(20)) AS recomendacion_marca,
          NULL AS comentarios,
          tec.nombres AS tecnico,
          ppqr.tipificacion_encuesta,
          NULL AS contacto_cliente,
          ppqr.estado_caso,
          ppqr.comentarios_final_caso,
          ppqr.tipificacion_cierre
        FROM posv_encuesta_satisfaccion pes
        INNER JOIN tall_encabeza_orden teo ON pes.n_orden = teo.numero
        INNER JOIN terceros tec ON teo.vendedor = tec.nit_real
        INNER JOIN terceros t ON teo.nit = t.nit_real
        INNER JOIN v_vh_vehiculos vhv ON vhv.codigo = teo.serie
        LEFT JOIN postv_pqr_nps ppqr ON ppqr.id_fuente = pes.id
        INNER JOIN bodegas b ON b.bodega = teo.bodega
        WHERE pes.pregunta1 <= 6
          AND CONVERT(DATE, pes.fecha) >= CONVERT(DATE, '2023-06-21')
          AND ${this.estadoClause('ppqr', estado)}
      `;
    }

    return Prisma.sql`
      SELECT
        'CODI' AS fuente,
        pes.id AS id,
        ppqr.id AS pqr_nps_id,
        b.descripcion AS sede,
        CASE WHEN ppqr.post_venta = 1 THEN 'POSTVENTA' WHEN ppqr.post_venta = 2 THEN 'VENTAS' ELSE '' END AS area,
        CONVERT(VARCHAR, pes.fecha, 23) AS fecha,
        vhv.placa,
        t.nombres AS cliente,
        vhv.descripcion AS modelo_vh,
        pes.n_orden AS orden,
        t.mail,
        t.celular AS telefono,
        CAST(pes.pregunta1 AS VARCHAR(20)) AS servicio,
        CAST(pes.pregunta2 AS VARCHAR(20)) AS satisfaccion_concesionario,
        CAST(pes.pregunta3 AS VARCHAR(20)) AS satisfaccion_trabajo,
        CAST(pes.pregunta4 AS VARCHAR(20)) AS vh_reparado_ok,
        CAST(pes.pregunta5 AS VARCHAR(20)) AS recomendacion_marca,
        NULL AS comentarios,
        tec.nombres AS tecnico,
        ppqr.tipificacion_encuesta,
        NULL AS contacto_cliente,
        ppqr.estado_caso,
        ppqr.comentarios_final_caso,
        ppqr.tipificacion_cierre
      FROM posv_encuesta_satisfaccion pes
      INNER JOIN tall_encabeza_orden teo ON pes.n_orden = teo.numero
      INNER JOIN terceros tec ON teo.vendedor = tec.nit_real
      INNER JOIN terceros t ON teo.nit = t.nit_real
      INNER JOIN v_vh_vehiculos vhv ON vhv.codigo = teo.serie
      LEFT JOIN postv_pqr_nps ppqr ON ppqr.id_fuente = pes.id
      INNER JOIN bodegas b ON b.bodega = teo.bodega
      WHERE pes.pregunta1 <= 6
        AND CONVERT(DATE, pes.fecha) >= CONVERT(DATE, '2021-11-01')
        AND ppqr.estado_caso = 'Cerrado'
    `;
  }

  private buildEncuestaQrSql(
    estado: 'abiertos' | 'cerrados' | 'todos',
  ): Prisma.Sql {
    if (estado !== 'cerrados') {
      return Prisma.sql`
        SELECT
          'QR' AS fuente,
          pes.id AS id,
          ppqr.id AS pqr_nps_id,
          b.descripcion AS sede,
          CASE WHEN ppqr.post_venta = 1 THEN 'POSTVENTA' WHEN ppqr.post_venta = 2 THEN 'VENTAS' ELSE '' END AS area,
          CONVERT(VARCHAR, pes.fecha, 23) AS fecha,
          vh.placa,
          t.nombres AS cliente,
          vh.descripcion AS modelo_vh,
          teo.numero AS orden,
          t.mail,
          t.celular AS telefono,
          CAST(pes.pregunta1 AS VARCHAR(20)) AS servicio,
          CAST(pes.pregunta2 AS VARCHAR(20)) AS satisfaccion_concesionario,
          CAST(pes.pregunta3 AS VARCHAR(20)) AS satisfaccion_trabajo,
          CAST(pes.pregunta4 AS VARCHAR(20)) AS vh_reparado_ok,
          CAST(pes.pregunta5 AS VARCHAR(20)) AS recomendacion_marca,
          NULL AS comentarios,
          tec.nombres AS tecnico,
          ppqr.tipificacion_encuesta,
          NULL AS contacto_cliente,
          ppqr.estado_caso,
          ppqr.comentarios_final_caso,
          ppqr.tipificacion_cierre
        FROM v_ultima_entrada_taller_datos a
        INNER JOIN tall_encabeza_orden teo ON a.uetd_numero = teo.numero AND a.uetd_serie = teo.serie
        INNER JOIN v_vh_vehiculos vh ON a.uetd_serie = vh.codigo
        INNER JOIN (
          SELECT *
          FROM postv_encuesta_satisfaccion_qr
          WHERE pregunta1 <= 8
            AND CONVERT(DATE, fecha) >= CONVERT(DATE, '2023-06-21')
        ) pes ON vh.placa = pes.placa
        INNER JOIN terceros tec ON teo.vendedor = tec.nit
        INNER JOIN terceros t ON teo.nit = t.nit_real
        LEFT JOIN postv_pqr_nps ppqr ON ppqr.id_fuente = pes.id AND ppqr.fuente = pes.fuente
        INNER JOIN bodegas b ON b.bodega = teo.bodega
        WHERE ${this.estadoClause('ppqr', estado)}
      `;
    }

    return Prisma.sql`
      SELECT
        'QR' AS fuente,
        pes.id AS id,
        ppqr.id AS pqr_nps_id,
        b.descripcion AS sede,
        CASE WHEN ppqr.post_venta = 1 THEN 'POSTVENTA' WHEN ppqr.post_venta = 2 THEN 'VENTAS' ELSE '' END AS area,
        CONVERT(VARCHAR, pes.fecha, 23) AS fecha,
        vh.placa,
        t.nombres AS cliente,
        vh.descripcion AS modelo_vh,
        teo.numero AS orden,
        t.mail,
        t.celular AS telefono,
        CAST(pes.pregunta1 AS VARCHAR(20)) AS servicio,
        CAST(pes.pregunta2 AS VARCHAR(20)) AS satisfaccion_concesionario,
        CAST(pes.pregunta3 AS VARCHAR(20)) AS satisfaccion_trabajo,
        CAST(pes.pregunta4 AS VARCHAR(20)) AS vh_reparado_ok,
        CAST(pes.pregunta5 AS VARCHAR(20)) AS recomendacion_marca,
        NULL AS comentarios,
        tec.nombres AS tecnico,
        ppqr.tipificacion_encuesta,
        NULL AS contacto_cliente,
        ppqr.estado_caso,
        ppqr.comentarios_final_caso,
        ppqr.tipificacion_cierre
      FROM v_ultima_entrada_taller_datos a
      INNER JOIN tall_encabeza_orden teo ON a.uetd_numero = teo.numero AND a.uetd_serie = teo.serie
      INNER JOIN v_vh_vehiculos vh ON a.uetd_serie = vh.codigo
      INNER JOIN (
        SELECT *
        FROM postv_encuesta_satisfaccion_qr
        WHERE pregunta1 <= 8
      ) pes ON vh.placa = pes.placa
      INNER JOIN terceros tec ON teo.vendedor = tec.nit
      INNER JOIN terceros t ON teo.nit = t.nit_real
      LEFT JOIN postv_pqr_nps ppqr ON ppqr.id_fuente = pes.id AND ppqr.fuente = pes.fuente
      INNER JOIN bodegas b ON b.bodega = teo.bodega
      WHERE CONVERT(DATE, pes.fecha) >= CONVERT(DATE, '2021-11-01')
        AND ppqr.estado_caso = 'Cerrado'
    `;
  }

  private estadoClause(
    alias: 'qn' | 'ppqr',
    estado: 'abiertos' | 'cerrados' | 'todos' = 'abiertos',
  ): Prisma.Sql {
    if (estado === 'todos') return Prisma.sql`1 = 1`;
    if (estado === 'cerrados')
      return Prisma.sql`${Prisma.raw(alias)}.estado_caso = 'Cerrado'`;
    return Prisma.sql`(${Prisma.raw(alias)}.estado_caso = 'Abierto' OR ${Prisma.raw(alias)}.estado_caso IS NULL)`;
  }
}
