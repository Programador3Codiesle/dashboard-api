import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
        v.marca,
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
        SUBSTRING(v.serie, 10, 1) as caract_10,
        ma.descripcion as marcaDescripcion
      from v_vh_vehiculos v 
      inner join referencias_cla c on v.clase = c.clase
      left join vh_marcas ma on v.marca = ma.marca
      left join v_km_promedio_dias kp on v.codigo = kp.codigo
      inner join terceros t on v.nit_comprador = t.nit	
      where v.clase not in ('*','GENERICO')
        and v.placa = ${placa}
    `;

    if (!rows || rows.length === 0) return null;

    const row = rows[0];

    const prepagado = await this.getMttoPrepagado(placa);

    // Mapping de marca a empresa lógica (1=Codiesel/Chevrolet, 2=Dieselco, 3=Mitsubishi, 4=BYD)
    const marca: string | null = row.marca ?? null;
    let empresaMarcaId: number | null = null;
    switch (marca) {
      case '010':
        empresaMarcaId = 1;
        break;
      case '302':
      case '304':
        empresaMarcaId = 2;
        break;
      case '140':
        empresaMarcaId = 3;
        break;
      case '303':
        empresaMarcaId = 4;
        break;
      default:
        empresaMarcaId = null;
    }

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
      prepagado,
      marca,
      marcaDescripcion: row.marcaDescripcion ?? null,
      empresaMarcaId,
    };
  }

  async getMttoPrepagado(placa: string): Promise<string | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT TOP 1 
        r.placa,
        e.descripcion AS prepagado
      FROM vh_eventos_vehiculos ev
      INNER JOIN referencias_imp r ON ev.codigo = r.codigo
      INNER JOIN vh_eventos e ON ev.evento = e.evento
      WHERE ev.evento IN (455, 460, 465, 470)
        AND r.placa = ${placa}
    `;

    if (!rows || rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return row.prepagado ?? null;
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
    yearModel: number;
  }): Promise<CotizacionRevisionDetalle> {
    const { bodega, clase, revision, yearModel } = params;

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

    const adicionalesMttoRows = await this.prisma.$queryRaw<any[]>`
      SELECT
        seq_rpto,
        clase,
        revision,
        codigo,
        descripcion,
        cantidad,
        tiempo_adicional,
        valor_mas_5anos,
        valor_menos_5anos,
        nombre_operacion
      FROM postv_adicionales_mto
      WHERE clase = ${clase}
        AND revision = ${revision}
    `;

    const yearActual = new Date().getFullYear();
    const diffYears = yearActual - yearModel;
    const usarValorMenos5 = diffYears <= 5;

    const mandatorySeq = new Set<number>(
      repuestosRows
        .filter(
          (r: any) =>
            r.Categoria === 'MANDATORIO' || r.Categoria === 'MANDATORIO CODIESEL',
        )
        .map((r: any) => Number(r.seq)),
    );

    const repuestos: RepuestoRevisionDetalle[] = repuestosRows.map((r: any) => ({
      seq: Number(r.seq),
      codigo: r.codigo,
      descripcion: r.descripcion,
      categoria: r.Categoria,
      cantidad: Number(r.Cantidad),
      valor: Number(r.Valor),
      unidades_disponibles: Number(r.unidades_disponibles ?? 0),
    }));

    const manoObraBase: ManoObraMttoDetalle[] = manoObraRows.map((m: any) => {
      const valorMenos5 = Number(m.valor_unitario ?? 0);
      const valorMas5 = Number(m.valor_mas_5anos ?? 0);
      const costo = usarValorMenos5 ? valorMenos5 : valorMas5;
      return {
        descripcion_operacion: m.descripcion_operacion,
        valor_unitario: costo,
        operacion: m.operacion,
        valor_mas_5anos: valorMas5,
        cant_horas: Number(m.cant_horas ?? 0),
      };
    });

    const manoObraAdicional: ManoObraMttoDetalle[] = adicionalesMttoRows.map(
      (a: any) => {
        const valorMenos5 = Number(a.valor_menos_5anos ?? 0);
        const valorMas5 = Number(a.valor_mas_5anos ?? 0);
        const costo = usarValorMenos5 ? valorMenos5 : valorMas5;
        const cantHoras = a.tiempo_adicional != null ? Number(a.tiempo_adicional) : 0;

        return {
          descripcion_operacion: a.nombre_operacion,
          valor_unitario: costo,
          operacion: a.codigo,
          valor_mas_5anos: valorMas5,
          cant_horas: cantHoras,
        };
      },
    );

    const manoObra: ManoObraMttoDetalle[] = [...manoObraBase, ...manoObraAdicional];

    return { repuestos, manoObra };
  }

  async crearCotizacion(data: NuevaCotizacionLivianos): Promise<number> {
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
        ${data.fecha_creacion ?? new Date()},
        ${data.estado},
        ${data.fecha_agenda ?? null}
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

  async crearPosibleRetorno(data: {
    id_usuario: number;
    placa: string;
    observacion: string;
    tipo_retorno: number;
    bodega: number | null;
  }): Promise<number> {
    const rows = await this.prisma.$queryRaw<any[]>`
      INSERT INTO dbo.postv_posible_retorno (id_usuario, placa, fecha_creacion, observacion, tipo_retorno, bodega)
      OUTPUT INSERTED.id_retorno
      VALUES (${data.id_usuario}, ${data.placa}, GETDATE(), ${data.observacion}, ${data.tipo_retorno}, ${data.bodega})
    `;
    if (!rows?.length) return 0;
    return Number(rows[0].id_retorno ?? 0);
  }

  async getAdicionalOnlyMo(adicional: number): Promise<boolean> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(DISTINCT mo.adicional) AS cantidad
      FROM dbo.postv_reptos_adicionales re
      RIGHT JOIN dbo.postv_mo_adicionales mo ON mo.adicional = re.adicional
      WHERE re.adicional IS NULL AND mo.adicional = ${adicional}
    `;
    const cantidad = rows?.[0]?.cantidad != null ? Number(rows[0].cantidad) : 0;
    return cantidad > 0;
  }

  async getRepuestosAdicionales(
    clase: string,
    bodega: number,
    adicional: number,
    year: number,
  ): Promise<RawSqlRow[]> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        v.adicional,
        codigo = CASE WHEN a.codigo IS NULL THEN v.codigo ELSE a.codigo END,
        v.descripcion,
        v.cantidad,
        Valor = CASE
          WHEN a.codigo IS NULL THEN CONVERT(decimal(10,2), ((p.precio_1 * v.cantidad) + (p.precio_1 * v.cantidad * 0.19)))
          ELSE CONVERT(decimal(10,2), ((p2.precio_1 * v.cantidad) + (p2.precio_1 * v.cantidad * 0.19)))
        END,
        unidades_disponibles = CASE WHEN a.codigo IS NULL THEN ISNULL(s.stock, 0) ELSE ISNULL(s2.stock, 0) END,
        v.descuento,
        na.adicional AS name_adicional
      FROM postv_reptos_adicionales v
      LEFT JOIN referencias rf ON v.codigo = rf.codigo
      LEFT JOIN referencias_alt a ON v.codigo = a.alterno
      LEFT JOIN referencias_pre p ON v.codigo = p.codigo
      LEFT JOIN referencias_pre p2 ON a.codigo = p2.codigo
      LEFT JOIN (
        SELECT codigo, stock FROM v_referencias_sto_hoy
        WHERE bodega = ${bodega} AND ano = YEAR(GETDATE()) AND mes = MONTH(GETDATE())
      ) s ON v.codigo = s.codigo
      LEFT JOIN (
        SELECT codigo, stock FROM v_referencias_sto_hoy
        WHERE bodega = ${bodega} AND ano = YEAR(GETDATE()) AND mes = MONTH(GETDATE())
      ) s2 ON a.codigo = s2.codigo
      INNER JOIN postv_adicionales_name na ON v.adicional = na.id
      WHERE v.clase = ${clase} AND v.adicional = ${adicional}
        AND ${year} BETWEEN v.year_start AND ISNULL(v.year_end, YEAR(DATEADD(YEAR, 1, GETDATE())))
    `;
    return rows ?? [];
  }

  async getManoObraAdicional(
    clase: string,
    adicional: number,
    operacion?: string,
  ): Promise<RawSqlRow[]> {
    const opFilter = operacion ? Prisma.sql`AND mo.operacion = ${operacion}` : Prisma.empty;
    const rows = await this.prisma.$queryRaw<any[]>(
      Prisma.sql`
      SELECT mo.id, mo.clase, mo.operacion, mo.tiempo,
        mo.valor_menos_5anos, mo.valor_mas_5anos, mo.adicional, mo.descuento,
        na.id AS id_adicional, na.adicional AS name_adicional, na.estado
      FROM postv_mo_adicionales mo
      INNER JOIN postv_adicionales_name na ON mo.adicional = na.id
      WHERE mo.clase = ${clase} AND mo.adicional = ${adicional}
      ${opFilter}
    `,
    );
    return rows ?? [];
  }
}
