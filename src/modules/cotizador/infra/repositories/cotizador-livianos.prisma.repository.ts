import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import {
  BodegaOption,
  ClaseDescripcion,
  CotizacionRevisionDetalle,
  ICotizadorLivianosRepository,
  ManoObraCotizacionInput,
  ManoObraMttoDetalle,
  NuevaCotizacionLivianos,
  RawSqlRow,
  RevisionOption,
  RepuestoRevisionDetalle,
  RepuestoCotizacionInput,
  VehiculoCotizacionLivianos,
} from '../../domain/cotizador-livianos.repository';

@Injectable()
export class CotizadorLivianosPrismaRepository implements ICotizadorLivianosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getVehiculoPorPlaca(placa: string): Promise<VehiculoCotizacionLivianos | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT 
        v.nit_comprador as nit, 
        t.nombres as cliente, 
        t.mail, 
        t.celular, 
        v.placa, 
        v.clase, 
        c.descripcion,
        v.ano as year, 
        v.des_modelo,
        v.kilometraje, 
        kp.uetd_entrada,
        kp.km_promedio,
        ((DATEDIFF(day, kp.uetd_entrada, CONVERT(date, GETDATE())) * kp.km_promedio) + v.kilometraje) as km_estimado,
        LEN(v.serie) as n_carac, 
        SUBSTRING(v.serie, 10, 1) as caract_10						
      from v_vh_vehiculos v 
      inner join referencias_cla c on v.clase = c.clase
      left join v_km_promedio_dias kp on v.codigo = kp.codigo
      inner join terceros t on v.nit_comprador = t.nit	
      where v.clase not in ('*','GENERICO')
        and v.placa = ${placa}
    `;

    if (!rows || rows.length === 0) return null;

    const row = rows[0];

    return {
      nit: row.nit,
      cliente: row.cliente,
      mail: row.mail ?? null,
      celular: row.celular ?? null,
      placa: row.placa,
      clase: row.clase,
      descripcion: row.descripcion,
      year: Number(row.year),
      des_modelo: row.des_modelo,
      kilometraje: Number(row.kilometraje ?? 0),
      uetd_entrada: row.uetd_entrada ?? null,
      km_promedio: row.km_promedio != null ? Number(row.km_promedio) : null,
      km_estimado: row.km_estimado != null ? Number(row.km_estimado) : null,
      n_carac: Number(row.n_carac ?? 0),
      caract_10: row.caract_10 ?? null,
    };
  }

  async getClasesForm(): Promise<ClaseDescripcion[]> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT DISTINCT v.clase, c.descripcion 
      from Postv_repuestos_mto v 
      inner join referencias_cla c on v.clase = c.clase
      ORDER BY c.descripcion
    `;

    return rows.map((r: any) => ({
      clase: r.clase,
      descripcion: r.descripcion,
    }));
  }

  async getBodegas(): Promise<BodegaOption[]> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT bodega, descripcion 
      from dbo.bodegas
      where bodega IN (select distinct bodega from v_referencias_sto)
      order by bodega
    `;

    return rows.map((r: any) => ({
      bodega: Number(r.bodega),
      descripcion: r.descripcion,
    }));
  }

  async getNameAdicionales(): Promise<RawSqlRow[]> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * 
      FROM postv_adicionales_name 
      WHERE estado = 1 
      ORDER BY adicional ASC
    `;
    return rows;
  }

  async getTiposRetornos(): Promise<RawSqlRow[]> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * 
      FROM postv_posible_tipo_retorno
    `;
    return rows;
  }

  async getRevisionesPorClase(clase: string): Promise<RevisionOption[]> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT DISTINCT Revision 
      FROM Postv_repuestos_mto
      WHERE Clase = ${clase}
      ORDER BY Revision ASC
    `;

    return rows.map((r: any) => ({
      revision: Number(r.Revision ?? r.revision),
    }));
  }

  async getRevisionDetalle(params: {
    bodega: number;
    clase: string;
    revision: number;
  }): Promise<CotizacionRevisionDetalle> {
    const { bodega, clase, revision } = params;

    const repuestosRows = await this.prisma.$queryRaw<any[]>`
      SELECT DISTINCT 
        r.seq,
        codigo = CASE WHEN a.codigo IS NULL THEN r.Codigo ELSE a.codigo END, 
        r.descripcion,
        r.Categoria,
        r.Cantidad,
        Valor = CASE 
          WHEN a.codigo IS NULL 
            THEN CONVERT(decimal(10,2), ((p.precio_1 * r.cantidad) + (p.precio_1 * r.cantidad * 0.19)))
          ELSE CONVERT(decimal(10,2), ((p2.precio_1 * r.cantidad) + (p2.precio_1 * r.cantidad * 0.19))) 
        END,
        unidades_disponibles = CASE 
          WHEN a.codigo IS NULL 
            THEN ISNULL(s.stock,0) 
          ELSE ISNULL(s2.stock,0) 
        END
      FROM v_vh_vehiculos v 
      INNER JOIN Postv_repuestos_mto r ON v.clase = r.clase
      LEFT JOIN referencias_alt a ON r.Codigo = a.alterno
      LEFT JOIN referencias_pre p ON r.Codigo = p.codigo
      LEFT JOIN referencias_pre p2 ON a.codigo = p2.codigo
      LEFT JOIN (
        SELECT codigo, stock 
        FROM v_referencias_sto_hoy 
        WHERE bodega = ${bodega} 
          AND ano = YEAR(GETDATE()) 
          AND mes = MONTH(GETDATE())
      ) s ON r.Codigo = s.codigo
      LEFT JOIN (
        SELECT codigo, stock 
        FROM v_referencias_sto_hoy 
        WHERE bodega = ${bodega} 
          AND ano = YEAR(GETDATE()) 
          AND mes = MONTH(GETDATE())
      ) s2 ON a.Codigo = s2.codigo
      WHERE v.clase = ${clase} 
        AND r.Revision = ${revision}
      ORDER BY r.Categoria ASC, r.descripcion ASC
    `;

    const manoObraRows = await this.prisma.$queryRaw<any[]>`
      SELECT DISTINCT 
        m.descripcion_operacion, 
        m.valor_unitario,
        m.operacion,
        m.valor_mas_5anos, 
        m.cant_horas
      FROM v_vh_vehiculos v 
      INNER JOIN postv_trabajos_mto_livianos m ON v.clase = m.clase
      WHERE v.clase = ${clase} 
        AND m.revision = ${revision}
      ORDER BY m.descripcion_operacion DESC
    `;

    const repuestos: RepuestoRevisionDetalle[] = repuestosRows.map((r: any) => ({
      seq: Number(r.seq),
      codigo: r.codigo,
      descripcion: r.descripcion,
      categoria: r.Categoria,
      cantidad: Number(r.Cantidad),
      valor: Number(r.Valor),
      unidades_disponibles: Number(r.unidades_disponibles ?? 0),
    }));

    const manoObra: ManoObraMttoDetalle[] = manoObraRows.map((m: any) => ({
      descripcion_operacion: m.descripcion_operacion,
      valor_unitario: Number(m.valor_unitario ?? 0),
      operacion: m.operacion,
      valor_mas_5anos: Number(m.valor_mas_5anos ?? 0),
      cant_horas: Number(m.cant_horas ?? 0),
    }));

    return { repuestos, manoObra };
  }

  async crearCotizacion(data: NuevaCotizacionLivianos): Promise<number> {
    const fecha = data.fecha_creacion ?? new Date();
    const fechaAgenda = data.fecha_agenda ?? null;

    const rows = await this.prisma.$queryRaw<any[]>`
      INSERT INTO dbo.postv_cotizacion_contact (
        nombreCliente,
        nitCliente,
        telfCliente,
        placa,
        clase,
        descripcion,
        des_modelo,
        kilometraje_actual,
        kilometraje_estimado,
        kilometraje_cliente,
        bodega,
        revision,
        emailCliente,
        usuario,
        observaciones,
        fecha_creacion,
        estado,
        fecha_agenda
      )
      OUTPUT INSERTED.id_cotizacion
      VALUES (
        ${data.nombreCliente},
        ${data.nitCliente},
        ${data.telfCliente ?? null},
        ${data.placa},
        ${data.clase},
        ${data.descripcion},
        ${data.des_modelo},
        ${data.kilometraje_actual},
        ${data.kilometraje_estimado ?? 0},
        ${data.kilometraje_cliente},
        ${data.bodega},
        ${data.revision},
        ${data.emailCliente ?? null},
        ${data.usuario},
        ${data.observaciones ?? null},
        ${fecha},
        ${data.estado},
        ${fechaAgenda}
      )
    `;

    if (!rows || !rows.length) {
      throw new Error('No se pudo crear la cotización.');
    }

    const insertedId = rows[0].id_cotizacion ?? rows[0].ID_COTIZACION ?? rows[0].Id_cotizacion;
    return Number(insertedId);
  }

  async agregarRepuestosCotizacion(idCotizacion: number, items: RepuestoCotizacionInput[]): Promise<void> {
    if (!items.length) return;

    for (const item of items) {
      await this.prisma.$executeRaw`
        INSERT INTO postv_cotizacion_repuestos (
          id_cotizacion,
          codigo,
          descripcion,
          cantidad,
          categoria,
          uni_disponibles,
          valor,
          estado,
          adicional
        )
        VALUES (
          ${idCotizacion},
          ${item.codigo},
          ${item.descripcion},
          ${item.cantidad},
          ${item.categoria ?? null},
          ${item.uni_disponibles},
          ${item.valor},
          ${item.estado},
          ${item.adicional ?? null}
        )
      `;
    }
  }

  async agregarManoObraCotizacion(idCotizacion: number, items: ManoObraCotizacionInput[]): Promise<void> {
    if (!items.length) return;

    for (const item of items) {
      await this.prisma.$executeRaw`
        INSERT INTO postv_cotizacion_mtto (
          id_cotizacion,
          mtto,
          valor,
          estado,
          cant_horas,
          adicional
        )
        VALUES (
          ${idCotizacion},
          ${item.mtto},
          ${item.valor},
          ${item.estado},
          ${item.cant_horas ?? null},
          ${item.adicional ?? null}
        )
      `;
    }
  }
}
