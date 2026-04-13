import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import {
  FilaCotizacionToFacturado,
  FilaFacturadoToCotizacion,
  ICotizadorEjecucionRepository,
  ResumenEjecucion,
  TotalesEjecucion,
} from '../../domain/cotizador-ejecucion.repository';

@Injectable()
export class CotizadorEjecucionPrismaRepository implements ICotizadorEjecucionRepository {
  constructor(private readonly prisma: PrismaService) {}

  private bodegasToList(bodegas: number[]): string {
    return bodegas.map((b) => String(b)).join(',');
  }

  async getResumen(
    desde: string,
    hasta: string,
    bodegas: number[],
  ): Promise<ResumenEjecucion | null> {
    const bodegasList = this.bodegasToList(bodegas);

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT 
        total_cotizaciones = (
          SELECT COUNT(id_cotizacion) 
          FROM postv_cotizacion_contact 
          WHERE fecha_creacion BETWEEN ${desde} AND ${hasta}
            AND bodega IN (${Prisma.raw(bodegasList)})
        ),
        env_sin_agenda = (
          SELECT COUNT(id_cotizacion) 
          FROM postv_cotizacion_contact 
          WHERE estado = 0
            AND fecha_creacion BETWEEN ${desde} AND ${hasta}
            AND bodega IN (${Prisma.raw(bodegasList)})
        ),
        env_agendadas = (
          SELECT COUNT(id_cotizacion) 
          FROM postv_cotizacion_contact 
          WHERE estado = 1
            AND fecha_creacion BETWEEN ${desde} AND ${hasta}
            AND bodega IN (${Prisma.raw(bodegasList)})
        ),
        asistidas = (
          SELECT COUNT(id_cotizacion) FROM
          (
            SELECT rnk = ROW_NUMBER() OVER (PARTITION BY id_cotizacion ORDER BY razon2 ASC), *
            FROM (
              SELECT DISTINCT 
                id_cotizacion,
                a.placa,
                CONVERT(date, fecha_agenda) as fecha_Agenda,
                CONVERT(date, c.fecha_hora_creacion) as fecha_crea_cita,
                c.estado_cita,
                CONVERT(date, c.fecha_hora_ini) as fecha_cita,
                CONVERT(date, e.fecha) as fecha_apertura_ot,
                e.numero,
                razon2
              FROM postv_cotizacion_contact a
              INNER JOIN tall_citas c
                ON a.placa = c.placa
               AND CONVERT(date, a.fecha_Agenda) = CONVERT(date, c.fecha_hora_creacion)
              INNER JOIN v_vh_vehiculos v ON a.placa = v.placa
              INNER JOIN tall_encabeza_orden e
                ON e.serie = v.codigo
               AND CONVERT(date, e.fecha) = CONVERT(date, c.fecha_hora_ini)
              WHERE a.estado = 1
                AND e.anulada = 0
                AND CONVERT(date, e.fecha) BETWEEN ${desde} AND ${hasta}
                AND e.bodega IN (${Prisma.raw(bodegasList)})
            ) ct
          ) t 
          WHERE rnk = 1
        )
    `;

    if (!rows || !rows.length) return null;
    const r = rows[0];

    return {
      total_cotizaciones: Number(r.total_cotizaciones ?? 0),
      env_sin_agenda: Number(r.env_sin_agenda ?? 0),
      env_agendadas: Number(r.env_agendadas ?? 0),
      asistidas: Number(r.asistidas ?? 0),
    };
  }

  async getTotales(
    desde: string,
    hasta: string,
    bodegas: number[],
  ): Promise<TotalesEjecucion | null> {
    const bodegasList = this.bodegasToList(bodegas);

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT 
        total_agendado = SUM(ISNULL(repuestos,0) + ISNULL(mano_obra,0)),
        total_facturado = SUM(ISNULL(rptos,0) + ISNULL(mo,0)),
        items_cotizados = SUM(ISNULL(items_cotizados,0)),
        items_facturados = SUM(ISNULL(items_facturados,0))
      FROM (
        SELECT * FROM
        (
          SELECT rnk = ROW_NUMBER() OVER (PARTITION BY id_cotizacion ORDER BY razon2 ASC), *
          FROM (
            SELECT DISTINCT 
              id_cotizacion,
              a.placa,
              CONVERT(date, fecha_agenda) as fecha_Agenda,
              CONVERT(date, c.fecha_hora_creacion) as fecha_crea_cita,
              c.estado_cita,
              CONVERT(date, c.fecha_hora_ini) as fecha_cita,
              CONVERT(date, e.fecha) as fecha_apertura_ot,
              e.numero,
              razon2,
              e.bodega
            FROM postv_cotizacion_contact a
            INNER JOIN tall_citas c
              ON a.placa = c.placa 
             AND CONVERT(date, a.fecha_Agenda) = CONVERT(date, c.fecha_hora_creacion)
            INNER JOIN v_vh_vehiculos v ON a.placa = v.placa
            INNER JOIN tall_encabeza_orden e
              ON e.serie = v.codigo 
             AND CONVERT(date, e.fecha) = CONVERT(date, c.fecha_hora_ini)
            WHERE a.estado = 1
              AND e.anulada = 0 
              AND CONVERT(date, e.fecha) BETWEEN ${desde} AND ${hasta}
              AND e.bodega IN (${Prisma.raw(bodegasList)})
          ) ct
        ) t
        WHERE rnk = 1
      ) cm
      LEFT JOIN (
        SELECT id_cotizacion, SUM(valor) as repuestos 
        FROM postv_cotizacion_repuestos 
        WHERE estado = 1 
        GROUP BY id_cotizacion
      ) m ON cm.id_cotizacion = m.id_cotizacion
      LEFT JOIN (
        SELECT id_cotizacion, SUM(valor) as mano_obra 
        FROM postv_cotizacion_mtto 
        WHERE estado = 1 
        GROUP BY id_cotizacion
      ) mo ON cm.id_cotizacion = mo.id_cotizacion
      LEFT JOIN (
        SELECT id_cotizacion, COUNT(codigo) as items_cotizados 
        FROM postv_cotizacion_repuestos 
        WHERE estado = 1 
        GROUP BY id_cotizacion
      ) ic ON cm.id_cotizacion = ic.id_cotizacion
      LEFT JOIN (
        SELECT numero_orden, CONVERT(int, SUM(venta_rptos + (venta_rptos * 0.19))) as rptos 
        FROM v_informe_tecnico 
        GROUP BY numero_orden
      ) d ON cm.numero = d.numero_orden
      LEFT JOIN (
        SELECT numero_orden, CONVERT(int, SUM(Venta_mano_obra + (Venta_mano_obra * 0.19))) as mo  
        FROM v_informe_tecnico 
        GROUP BY numero_orden
      ) d1 ON cm.numero = d1.numero_orden
      LEFT JOIN (
        SELECT numero_orden, COUNT(operacion) as items_facturados 
        FROM v_informe_tecnico it 
        INNER JOIN tall_encabeza_orden te 
          ON it.numero_orden = te.numero 
         AND te.anulada = 0
        WHERE venta_rptos > 0 
        GROUP BY numero_orden
      ) ir ON cm.numero = ir.numero_orden
    `;

    if (!rows || !rows.length) return null;
    const r = rows[0];

    return {
      total_agendado: Number(r.total_agendado ?? 0),
      total_facturado: Number(r.total_facturado ?? 0),
      items_cotizados: Number(r.items_cotizados ?? 0),
      items_facturados: Number(r.items_facturados ?? 0),
    };
  }

  async getCotizacionToFacturado(
    desde: string,
    hasta: string,
    bodegas: number[],
  ): Promise<FilaCotizacionToFacturado[]> {
    const bodegasList = this.bodegasToList(bodegas);

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT cm.id_cotizacion,
             cm.numero,
             d.operacion,
             ISNULL(d.valor_rep,0) as valor_facturado,
             ISNULL(m.codigo,'No cotizado') as codigo,
             ISNULL(m.valor,0) as valor_cotizado
      FROM (
        SELECT * FROM
        (
          SELECT rnk = ROW_NUMBER() OVER (PARTITION BY id_cotizacion ORDER BY razon2 ASC),*
          FROM (
            SELECT DISTINCT 
              id_cotizacion,
              a.placa,
              CONVERT(date, fecha_agenda) as fecha_Agenda,
              CONVERT(date, c.fecha_hora_creacion) as fecha_crea_cita,
              c.estado_cita,
              CONVERT(date, c.fecha_hora_ini) as fecha_cita,
              CONVERT(date, e.fecha) as fecha_apertura_ot,
              e.numero,
              razon2,
              e.bodega
            FROM postv_cotizacion_contact a 
            INNER JOIN tall_citas c
              ON a.placa = c.placa 
             AND CONVERT(date, a.fecha_Agenda) = CONVERT(date, c.fecha_hora_creacion)
            INNER JOIN v_vh_vehiculos v ON a.placa = v.placa
            INNER JOIN tall_encabeza_orden e 
              ON e.serie = v.codigo 
             AND CONVERT(date, e.fecha) = CONVERT(date, c.fecha_hora_ini)
            WHERE a.estado = 1 
              AND e.anulada = 0 
              AND CONVERT(date, e.fecha) BETWEEN ${desde} AND ${hasta}
              AND e.bodega IN (${Prisma.raw(bodegasList)})
          ) ct
        ) t
        WHERE rnk = 1
      ) cm
      INNER JOIN (
        SELECT numero_orden,
               operacion,
               CONVERT(int, SUM(venta_rptos + (venta_rptos * 0.19))) as valor_rep 
        FROM v_informe_tecnico 
        GROUP BY numero_orden, operacion
      ) d ON cm.numero = d.numero_orden 
      LEFT JOIN (
        SELECT id_cotizacion, codigo, SUM(valor) as valor 
        FROM postv_cotizacion_repuestos 
        WHERE estado = 1
        GROUP BY id_cotizacion, codigo
      ) m ON cm.id_cotizacion = m.id_cotizacion AND m.codigo = d.operacion

      UNION

      SELECT cm.id_cotizacion,
             cm.numero,
             operacion,
             mo as valor_facturado,
             ISNULL(mo.codigo,'No cotizado') as codigo,
             ISNULL(mo.valor_mano_obra,0) as valor_cotizado
      FROM (
        SELECT * FROM
        (
          SELECT rnk = ROW_NUMBER() OVER (PARTITION BY id_cotizacion ORDER BY razon2 ASC),*
          FROM (
            SELECT DISTINCT 
              id_cotizacion,
              a.placa,
              CONVERT(date, fecha_agenda) as fecha_Agenda,
              CONVERT(date, c.fecha_hora_creacion) as fecha_crea_cita,
              c.estado_cita,
              CONVERT(date, c.fecha_hora_ini) as fecha_cita,
              CONVERT(date, e.fecha) as fecha_apertura_ot,
              e.numero,
              razon2,
              e.bodega
            FROM postv_cotizacion_contact a 
            INNER JOIN tall_citas c
              ON a.placa = c.placa 
             AND CONVERT(date, a.fecha_Agenda) = CONVERT(date, c.fecha_hora_creacion)
            INNER JOIN v_vh_vehiculos v ON a.placa = v.placa
            INNER JOIN tall_encabeza_orden e 
              ON e.serie = v.codigo 
             AND CONVERT(date, e.fecha) = CONVERT(date, c.fecha_hora_ini)
            WHERE a.estado = 1 
              AND e.anulada = 0 
              AND CONVERT(date, e.fecha) BETWEEN ${desde} AND ${hasta}
              AND e.bodega IN (${Prisma.raw(bodegasList)})
          ) ct
        ) t
        WHERE rnk = 1
      ) cm
      INNER JOIN (
        SELECT numero_orden,
               operacion = 'mano de obra', 
               CONVERT(int, SUM(Venta_mano_obra + (Venta_mano_obra * 0.19))) as mo  
        FROM v_informe_tecnico 
        WHERE bodega IN (${Prisma.raw(bodegasList)})
        GROUP BY numero_orden
      ) d1 ON cm.numero = d1.numero_orden 
      LEFT JOIN (
        SELECT id_cotizacion,
               codigo = 'Mano de obra',
               SUM(valor) as valor_mano_obra 
        FROM postv_cotizacion_mtto 
        WHERE estado = 1 
        GROUP BY id_cotizacion
      ) mo ON cm.id_cotizacion = mo.id_cotizacion AND mo.codigo = d1.operacion
    `;

    return rows.map<FilaCotizacionToFacturado>((r: any) => ({
      id_cotizacion: Number(r.id_cotizacion),
      numero: Number(r.numero),
      codigo: r.codigo,
      valor_cotizado: Number(r.valor_cotizado ?? 0),
      operacion: r.operacion,
      valor_facturado: Number(r.valor_facturado ?? 0),
    }));
  }

  async getFacturadoToCotizacion(
    desde: string,
    hasta: string,
    bodegas: number[],
  ): Promise<FilaFacturadoToCotizacion[]> {
    const bodegasList = this.bodegasToList(bodegas);

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT cm.id_cotizacion,
             cm.numero,
             d.operacion,
             ISNULL(d.valor_rep,0) as valor_facturado,
             ISNULL(m.codigo,'No cotizado') as codigo,
             ISNULL(m.valor,0) as valor_cotizado
      FROM (
        SELECT * FROM
        (
          SELECT rnk = ROW_NUMBER() OVER (PARTITION BY id_cotizacion ORDER BY razon2 ASC),*
          FROM (
            SELECT DISTINCT 
              id_cotizacion,
              a.placa,
              CONVERT(date, fecha_agenda) as fecha_Agenda,
              CONVERT(date, c.fecha_hora_creacion) as fecha_crea_cita,
              c.estado_cita,
              CONVERT(date, c.fecha_hora_ini) as fecha_cita,
              CONVERT(date, e.fecha) as fecha_apertura_ot,
              e.numero,
              razon2,
              e.bodega
            FROM postv_cotizacion_contact a 
            INNER JOIN tall_citas c
              ON a.placa = c.placa 
             AND CONVERT(date, a.fecha_Agenda) = CONVERT(date, c.fecha_hora_creacion)
            INNER JOIN v_vh_vehiculos v ON a.placa = v.placa
            INNER JOIN tall_encabeza_orden e 
              ON e.serie = v.codigo 
             AND CONVERT(date, e.fecha) = CONVERT(date, c.fecha_hora_ini)
            WHERE a.estado = 1 
              AND e.anulada = 0 
              AND CONVERT(date, e.fecha) BETWEEN ${desde} AND ${hasta}
              AND e.bodega IN (${Prisma.raw(bodegasList)})
          ) ct
        ) t
        WHERE rnk = 1
      ) cm
      INNER JOIN (
        SELECT id_cotizacion, codigo, SUM(valor) as valor 
        FROM postv_cotizacion_repuestos 
        WHERE estado = 1 
        GROUP BY id_cotizacion, codigo
      ) m ON cm.id_cotizacion = m.id_cotizacion
      LEFT JOIN (
        SELECT numero_orden, operacion, CONVERT(int, SUM(venta_rptos + (venta_rptos * 0.19))) as valor_rep 
        FROM v_informe_tecnico 
        GROUP BY numero_orden, operacion
      ) d ON cm.numero = d.numero_orden AND m.codigo = d.operacion

      UNION

      SELECT cm.id_cotizacion,
             cm.numero,
             mo.codigo,
             mo.valor_mano_obra as valor_cotizado,
             ISNULL(d1.operacion,'No facturada') as operacion,
             ISNULL(d1.mo,0) as valor_facturado
      FROM (
        SELECT * FROM
        (
          SELECT rnk = ROW_NUMBER() OVER (PARTITION BY id_cotizacion ORDER BY razon2 ASC),*
          FROM (
            SELECT DISTINCT 
              id_cotizacion,
              a.placa,
              CONVERT(date, fecha_agenda) as fecha_Agenda,
              CONVERT(date, c.fecha_hora_creacion) as fecha_crea_cita,
              c.estado_cita,
              CONVERT(date, c.fecha_hora_ini) as fecha_cita,
              CONVERT(date, e.fecha) as fecha_apertura_ot,
              e.numero,
              razon2,
              e.bodega
            FROM postv_cotizacion_contact a 
            INNER JOIN tall_citas c
              ON a.placa = c.placa 
             AND CONVERT(date, a.fecha_Agenda) = CONVERT(date, c.fecha_hora_creacion)
            INNER JOIN v_vh_vehiculos v ON a.placa = v.placa
            INNER JOIN tall_encabeza_orden e 
              ON e.serie = v.codigo 
             AND CONVERT(date, e.fecha) = CONVERT(date, c.fecha_hora_ini)
            WHERE a.estado = 1 
              AND e.anulada = 0 
              AND CONVERT(date, e.fecha) BETWEEN ${desde} AND ${hasta}
              AND e.bodega IN (${Prisma.raw(bodegasList)})
          ) ct
        ) t
        WHERE rnk = 1
      ) cm
      INNER JOIN (
        SELECT id_cotizacion,
               codigo = 'Mano de obra',
               SUM(valor) as valor_mano_obra 
        FROM postv_cotizacion_mtto 
        WHERE estado = 1 
        GROUP BY id_cotizacion
      ) mo ON cm.id_cotizacion = mo.id_cotizacion
      LEFT JOIN (
        SELECT numero_orden,
               operacion = 'mano de obra',
               CONVERT(int, SUM(Venta_mano_obra + (Venta_mano_obra * 0.19))) as mo  
        FROM v_informe_tecnico 
        WHERE bodega IN (${Prisma.raw(bodegasList)})
        GROUP BY numero_orden
      ) d1 ON cm.numero = d1.numero_orden  AND mo.codigo = d1.operacion
    `;

    return rows.map<FilaFacturadoToCotizacion>((r: any) => ({
      id_cotizacion: Number(r.id_cotizacion),
      numero: Number(r.numero),
      operacion: r.operacion,
      valor_facturado: Number(r.valor_facturado ?? 0),
      codigo: r.codigo,
      valor_cotizado: Number(r.valor_cotizado ?? 0),
    }));
  }
}
