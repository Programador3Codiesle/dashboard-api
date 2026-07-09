import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import {
  ClaseDescripcionPesados,
  GrupoMantenimientoPesados,
  ICotizadorPesadosRepository,
  MantenimientoPesadosResponse,
  ManoObraCotizacionPesadosInput,
  ManoObraMantenimientoPesados,
  ModeloPesados,
  NuevaCotizacionPesados,
  RepuestoCotizacionPesadosInput,
  RepuestoMantenimientoPesados,
  RevisionPesados,
  VehiculoCotizacionPesados,
} from '../../domain/cotizador-pesados.repository';

@Injectable()
export class CotizadorPesadosPrismaRepository implements ICotizadorPesadosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getClasesDescripcion(): Promise<ClaseDescripcionPesados[]> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT DISTINCT v.clase, cl.descripcion
      FROM v_vh_vehiculos v
      INNER JOIN referencias_cla cl ON v.clase = cl.clase
      INNER JOIN documentos_lin dl ON dl.codigo = v.codigo
      INNER JOIN vh_modelo m ON v.modelo = m.modelo
      INNER JOIN vh_familias f ON m.familia = f.familia
      WHERE dl.sw = 1 
        AND dl.cantidad_devuelta IS NULL 
        AND (f.descripcion LIKE 'F%' OR f.descripcion LIKE 'N%') 
        AND f.id NOT IN (51, 84)
        AND v.marca = '010' 
        AND v.clase NOT IN ('*', 'GENERICO')
      ORDER BY v.clase
    `;

    return rows.map((r: any) => ({
      clase: r.clase,
      descripcion: r.descripcion,
    }));
  }

  async getVehiculoPorPlaca(
    placa: string,
  ): Promise<VehiculoCotizacionPesados | null> {
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
      FROM v_vh_vehiculos v
      INNER JOIN referencias_cla c ON v.clase = c.clase
      LEFT JOIN v_km_promedio_dias kp ON v.codigo = kp.codigo
      INNER JOIN terceros t ON v.nit_comprador = t.nit
      WHERE v.clase NOT IN ('*', 'GENERICO')
        AND v.placa = ${placa}
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

  async getModelosByClase(clase: string): Promise<ModeloPesados[]> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT DISTINCT v.des_modelo AS descripcion
      FROM postv_reptos_mto_pesados p
      LEFT JOIN v_vh_vehiculos v ON v.clase = p.clase
      WHERE v.des_modelo IS NOT NULL
        AND v.clase = ${clase}
      ORDER BY v.des_modelo ASC
    `;

    return rows.map((r: any) => ({ descripcion: r.descripcion }));
  }

  async getRevisionesByClase(clase: string): Promise<RevisionPesados[]> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT DISTINCT revision
      FROM postv_reptos_mto_pesados
      WHERE clase = ${clase}
    `;

    return rows.map((r: any) => ({
      revision: Number(r.revision ?? r.Revision),
    }));
  }

  private async getRepuestosMtto(params: {
    clase: string;
    revision: number;
    bodega: number;
    grupo: string;
  }): Promise<RepuestoMantenimientoPesados[]> {
    const { clase, revision, bodega, grupo } = params;

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT DISTINCT 
        r.seq,
        Codigo = CASE WHEN al.alterno IS NOT NULL THEN al.codigo ELSE r.codigo END,
        r.descripcion,
        r.Categoria,
        r.Cantidad,
        r.grupo,
        r.ano_inicio,
        ISNULL(r.ano_fin, YEAR(GETDATE())) AS ano_fin,
        Valor = CASE 
          WHEN al.alterno IS NOT NULL 
            THEN CONVERT(decimal(10,2), ((p1.precio_1 * r.cantidad) + (p1.precio_1 * r.cantidad * q.porcentaje_iva / 100))) 
          ELSE CONVERT(decimal(10,2), ((p.precio_1 * r.cantidad) + (p.precio_1 * r.cantidad * rf.porcentaje_iva / 100))) 
        END,
        unidades_disponibles = CASE 
          WHEN al.alterno IS NOT NULL 
            THEN ISNULL(s1.stock,0) 
          ELSE ISNULL(s.stock,0) 
        END,
        r.kit
      FROM postv_reptos_mto_pesados r
      LEFT JOIN referencias rf ON r.Codigo = rf.codigo
      LEFT JOIN referencias_alt al ON r.codigo = al.alterno
      LEFT JOIN referencias q ON al.codigo = q.codigo
      LEFT JOIN referencias_pre p ON r.Codigo = p.codigo
      LEFT JOIN referencias_pre p1 ON al.codigo = p1.codigo
      LEFT JOIN (
        SELECT codigo, stock 
        FROM v_referencias_sto 
        WHERE bodega = ${bodega} 
          AND ano = YEAR(GETDATE()) 
          AND mes = MONTH(GETDATE())
      ) s ON r.Codigo = s.codigo
      LEFT JOIN (
        SELECT codigo, stock 
        FROM v_referencias_sto 
        WHERE bodega = ${bodega} 
          AND ano = YEAR(GETDATE()) 
          AND mes = MONTH(GETDATE())
      ) s1 ON al.codigo = s1.codigo
      WHERE r.clase = ${clase} 
        AND r.Revision = ${revision} 
        AND r.grupo = ${grupo}
      ORDER BY r.ano_inicio ASC, r.descripcion ASC
    `;

    return rows.map((r: any) => ({
      seq: Number(r.seq),
      codigo: r.Codigo ?? r.codigo,
      descripcion: r.descripcion,
      categoria: r.Categoria,
      cantidad: Number(r.Cantidad ?? 0),
      grupo: r.grupo,
      ano_inicio: Number(r.ano_inicio ?? 0),
      ano_fin: Number(r.ano_fin ?? 0),
      valor: Number(r.Valor ?? 0),
      unidades_disponibles: Number(r.unidades_disponibles ?? 0),
      kit: Number(r.kit ?? 0),
    }));
  }

  private async getManoObraGrupo(params: {
    clase: string;
    grupo: string;
    bodega: number;
  }): Promise<ManoObraMantenimientoPesados[]> {
    const { clase, grupo, bodega } = params;

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT 
        seq, 
        operacion, 
        descrpcion, 
        horas,
        (horas * (SELECT valor_hora + (valor_hora * 0.19) FROM tall_tarifas_taller WHERE bodega = ${bodega})) AS valor
      FROM postv_trabajo_mto_pesados
      WHERE clase = ${clase}
        AND grupo = ${grupo}
    `;

    return rows.map((r: any) => ({
      seq: Number(r.seq),
      operacion: r.operacion,
      descrpcion: r.descrpcion,
      horas: Number(r.horas ?? 0),
      valor: Number(r.valor ?? 0),
    }));
  }

  async getMantenimientoPesados(params: {
    clase: string;
    revision: number;
    bodega: number;
    yearModel: number;
  }): Promise<MantenimientoPesadosResponse> {
    const { clase, revision, bodega, yearModel } = params;
    const grupoAC = 'ACDelco';
    const grupoGM = 'GM';

    const repuestosAC = await this.getRepuestosMtto({
      clase,
      revision,
      bodega,
      grupo: grupoAC,
    });
    const repuestosGM = await this.getRepuestosMtto({
      clase,
      revision,
      bodega,
      grupo: grupoGM,
    });
    const manoObraAC = await this.getManoObraGrupo({
      clase,
      grupo: grupoAC,
      bodega,
    });
    const manoObraGM = await this.getManoObraGrupo({
      clase,
      grupo: grupoGM,
      bodega,
    });

    const filtrarPorYear = (items: RepuestoMantenimientoPesados[]) =>
      items.filter((r) => yearModel >= r.ano_inicio && yearModel <= r.ano_fin);

    const grupoACDelco: GrupoMantenimientoPesados = {
      grupo: grupoAC,
      repuestos: filtrarPorYear(repuestosAC),
      manoObra: manoObraAC,
    };

    const grupoGMData: GrupoMantenimientoPesados = {
      grupo: grupoGM,
      repuestos: filtrarPorYear(repuestosGM),
      manoObra: manoObraGM,
    };

    return { grupos: [grupoACDelco, grupoGMData] };
  }

  async crearCotizacion(data: NuevaCotizacionPesados): Promise<number> {
    const fecha = data.fecha_creacion ?? new Date();
    const fechaAgenda = data.fecha_agenda ?? null;

    const rows = await this.prisma.$queryRaw<any[]>`
      INSERT INTO dbo.postv_cotizacion_contact_p (
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
      throw new Error('No se pudo crear la cotización de pesados.');
    }

    const insertedId =
      rows[0].id_cotizacion ?? rows[0].ID_COTIZACION ?? rows[0].Id_cotizacion;
    return Number(insertedId);
  }

  async agregarRepuestosCotizacion(
    idCotizacion: number,
    items: RepuestoCotizacionPesadosInput[],
  ): Promise<void> {
    if (!items.length) return;

    for (const item of items) {
      await this.prisma.$executeRaw`
        INSERT INTO postv_cotizacion_repuestos_p (
          id_cotizacion,
          codigo,
          descripcion,
          cantidad,
          categoria,
          uni_disponibles,
          valor,
          estado,
          grupo
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
          ${item.grupo}
        )
      `;
    }
  }

  async agregarManoObraCotizacion(
    idCotizacion: number,
    items: ManoObraCotizacionPesadosInput[],
  ): Promise<void> {
    if (!items.length) return;

    for (const item of items) {
      await this.prisma.$executeRaw`
        INSERT INTO postv_cotizacion_mtto_p (
          id_cotizacion,
          mtto,
          valor,
          estado,
          cant_horas,
          grupo
        )
        VALUES (
          ${idCotizacion},
          ${item.mtto},
          ${item.valor},
          ${item.estado},
          ${item.cant_horas ?? null},
          ${item.grupo}
        )
      `;
    }
  }
}
