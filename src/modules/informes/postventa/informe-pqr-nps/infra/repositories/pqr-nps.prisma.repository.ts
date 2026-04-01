import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import { IPqrNpsRepository, FiltrosPqrNps } from '../../domain/pqr-nps.repository';
import { PqrNpsItemEntity } from '../../domain/pqr-nps.entity';

@Injectable()
export class PqrNpsPrismaRepository implements IPqrNpsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(filtros: FiltrosPqrNps): Promise<PqrNpsItemEntity[]> {
    const cerradoFlag =
      filtros.estado === 'cerrados'
        ? `'Cerrado'`
        : filtros.estado === 'abiertos'
        ? `''` // se interpretará como abiertos en las cláusulas
        : '';

    const gmSql = this.buildEncuestasGmSql(cerradoFlag);
    const codSql = this.buildPqrCodieselSql(cerradoFlag);
    const codiSql = this.buildEncuestasCodiSql(cerradoFlag);
    const qrSql = this.buildEncuestaQrSql(cerradoFlag);

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
        sede: string;
        area: string;
        fecha: string;
        placa: string;
        cliente: string;
        modelo_vh: string;
        orden: string;
        mail: string;
        telefono: string;
        servicio: number | null;
        satisfaccion_concesionario: number | null;
        satisfaccion_trabajo: number | null;
        vh_reparado_ok: number | null;
        recomendacion_marca: number | null;
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

  private buildEncuestasGmSql(cerradoFlag: string): Prisma.Sql {
    if (!cerradoFlag) {
      return Prisma.sql`
        SELECT
          'GM' AS fuente,
          pgm.id_encuesta AS id,
          b.descripcion AS sede,
          CASE WHEN qn.post_venta = 1 THEN 'POSTVENTA' WHEN qn.post_venta = 2 THEN 'VENTAS' ELSE '' END AS area,
          CONVERT(VARCHAR, pgm.fecha_evento, 23) AS fecha,
          vhv.placa,
          t.nombres AS cliente,
          vhv.descripcion AS modelo_vh,
          ut.uetd_numero AS orden,
          t.mail,
          t.celular AS telefono,
          pgm.recomendacion_concesionario AS servicio,
          pgm.satisfaccion_concesionario,
          pgm.satisfaccion_trabajo,
          pgm.vh_reparado_ok,
          pgm.recomendacion_marca,
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
          AND (qn.estado_caso = 'Abierto' OR qn.estado_caso IS NULL)
          AND pgm.fecha_evento >= '2023-11-01'
      `;
    }

    // cerrados
    return Prisma.sql`
      SELECT
        'GM' AS fuente,
        pgm.id_encuesta AS id,
        b.descripcion AS sede,
        CASE WHEN qn.post_venta = 1 THEN 'POSTVENTA' WHEN qn.post_venta = 2 THEN 'VENTAS' ELSE '' END AS area,
        CONVERT(VARCHAR, pgm.fecha_evento, 23) AS fecha,
        vhv.placa,
        t.nombres AS cliente,
        vhv.descripcion AS modelo_vh,
        ut.uetd_numero AS orden,
        t.mail,
        t.celular AS telefono,
        pgm.recomendacion_concesionario AS servicio,
        pgm.satisfaccion_concesionario,
        pgm.satisfaccion_trabajo,
        pgm.vh_reparado_ok,
        pgm.recomendacion_marca,
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
        AND qn.estado_caso IN ('Cerrado')
    `;
  }

  private buildPqrCodieselSql(cerradoFlag: string): Prisma.Sql {
    if (!cerradoFlag) {
      return Prisma.sql`
        SELECT
          pqr.fuente AS fuente,
          pqr.id_pqr AS id,
          pqr.sede,
          CASE WHEN ppqr.post_venta = 1 THEN 'POSTVENTA' WHEN ppqr.post_venta = 2 THEN 'VENTAS' ELSE '' END AS area,
          CONVERT(VARCHAR, pqr.fecha, 23) AS fecha,
          pqr.placa,
          t.nombres AS cliente,
          pqr.modelo_vh AS modelo_vh,
          pqr.ot AS orden,
          t.mail,
          t.celular AS telefono,
          NULL AS servicio,
          NULL AS satisfaccion_concesionario,
          NULL AS satisfaccion_trabajo,
          NULL AS vh_reparado_ok,
          NULL AS recomendacion_marca,
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
        WHERE (ppqr.estado_caso = 'Abierto' OR ppqr.estado_caso IS NULL)
      `;
    }

    return Prisma.sql`
      SELECT
        pqr.fuente AS fuente,
        pqr.id_pqr AS id,
        pqr.sede,
        CASE WHEN ppqr.post_venta = 1 THEN 'POSTVENTA' WHEN ppqr.post_venta = 2 THEN 'VENTAS' ELSE '' END AS area,
        CONVERT(VARCHAR, pqr.fecha, 23) AS fecha,
        pqr.placa,
        t.nombres AS cliente,
        pqr.modelo_vh AS modelo_vh,
        pqr.ot AS orden,
        t.mail,
        t.celular AS telefono,
        NULL AS servicio,
        NULL AS satisfaccion_concesionario,
        NULL AS satisfaccion_trabajo,
        NULL AS vh_reparado_ok,
        NULL AS recomendacion_marca,
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
      WHERE ppqr.estado_caso IN ('Cerrado')
    `;
  }

  private buildEncuestasCodiSql(cerradoFlag: string): Prisma.Sql {
    if (!cerradoFlag) {
      return Prisma.sql`
        SELECT
          'CODI' AS fuente,
          pes.id AS id,
          b.descripcion AS sede,
          CASE WHEN ppqr.post_venta = 1 THEN 'POSTVENTA' WHEN ppqr.post_venta = 2 THEN 'VENTAS' ELSE '' END AS area,
          CONVERT(VARCHAR, pes.fecha, 23) AS fecha,
          vhv.placa,
          t.nombres AS cliente,
          vhv.descripcion AS modelo_vh,
          pes.n_orden AS orden,
          t.mail,
          t.celular AS telefono,
          pes.pregunta1 AS servicio,
          pes.pregunta2 AS satisfaccion_concesionario,
          pes.pregunta3 AS satisfaccion_trabajo,
          pes.pregunta4 AS vh_reparado_ok,
          pes.pregunta5 AS recomendacion_marca,
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
          AND ppqr.estado_caso = 'Abierto'
      `;
    }

    return Prisma.sql`
      SELECT
        'CODI' AS fuente,
        pes.id AS id,
        b.descripcion AS sede,
        CASE WHEN ppqr.post_venta = 1 THEN 'POSTVENTA' WHEN ppqr.post_venta = 2 THEN 'VENTAS' ELSE '' END AS area,
        CONVERT(VARCHAR, pes.fecha, 23) AS fecha,
        vhv.placa,
        t.nombres AS cliente,
        vhv.descripcion AS modelo_vh,
        pes.n_orden AS orden,
        t.mail,
        t.celular AS telefono,
        pes.pregunta1 AS servicio,
        pes.pregunta2 AS satisfaccion_concesionario,
        pes.pregunta3 AS satisfaccion_trabajo,
        pes.pregunta4 AS vh_reparado_ok,
        pes.pregunta5 AS recomendacion_marca,
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
        AND ppqr.estado_caso IN ('Cerrado')
    `;
  }

  private buildEncuestaQrSql(cerradoFlag: string): Prisma.Sql {
    if (!cerradoFlag) {
      return Prisma.sql`
        SELECT
          'QR' AS fuente,
          pes.id AS id,
          b.descripcion AS sede,
          CASE WHEN ppqr.post_venta = 1 THEN 'POSTVENTA' WHEN ppqr.post_venta = 2 THEN 'VENTAS' ELSE '' END AS area,
          CONVERT(VARCHAR, pes.fecha, 23) AS fecha,
          vh.placa,
          t.nombres AS cliente,
          vh.descripcion AS modelo_vh,
          teo.numero AS orden,
          t.mail,
          t.celular AS telefono,
          pes.pregunta1 AS servicio,
          pes.pregunta2 AS satisfaccion_concesionario,
          pes.pregunta3 AS satisfaccion_trabajo,
          pes.pregunta4 AS vh_reparado_ok,
          pes.pregunta5 AS recomendacion_marca,
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
        WHERE ppqr.estado_caso = 'Abierto' OR ppqr.estado_caso IS NULL
      `;
    }

    return Prisma.sql`
      SELECT
        'QR' AS fuente,
        pes.id AS id,
        b.descripcion AS sede,
        CASE WHEN ppqr.post_venta = 1 THEN 'POSTVENTA' WHEN ppqr.post_venta = 2 THEN 'VENTAS' ELSE '' END AS area,
        CONVERT(VARCHAR, pes.fecha, 23) AS fecha,
        vh.placa,
        t.nombres AS cliente,
        vh.descripcion AS modelo_vh,
        teo.numero AS orden,
        t.mail,
        t.celular AS telefono,
        pes.pregunta1 AS servicio,
        pes.pregunta2 AS satisfaccion_concesionario,
        pes.pregunta3 AS satisfaccion_trabajo,
        pes.pregunta4 AS vh_reparado_ok,
        pes.pregunta5 AS recomendacion_marca,
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
        AND ppqr.estado_caso IN ('Cerrado')
    `;
  }
}

