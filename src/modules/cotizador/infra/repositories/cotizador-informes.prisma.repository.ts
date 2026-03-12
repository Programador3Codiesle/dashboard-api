import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import {
  CotizacionResumen,
  CotizacionMttoRow,
  CotizacionPdfGeneral,
  CotizacionRepuestoRow,
  ICotizadorInformesRepository,
} from '../../domain/cotizador-informes.repository';

@Injectable()
export class CotizadorInformesPrismaRepository implements ICotizadorInformesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listarCotizacionesLivianos(
    dateStart: string,
    dateEnd: string,
    empresaId?: number,
  ): Promise<CotizacionResumen[]> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT 
        CT.id_cotizacion,
        CT.placa,
        CT.clase,
        CT.des_modelo,
        CT.kilometraje_cliente,
        CT.revision,
        CT.bodega,
        b.descripcion AS NomBodega,
        Crm.nombre AS asesor,
        Crm.e_mail AS correo,
        CT.estado,
        CT.fecha_creacion,
        (SELECT DATEADD(DAY,30,CONVERT(DATE,CT.fecha_creacion,23))) as caducidad
      FROM dbo.postv_cotizacion_contact CT
      LEFT JOIN v_vh_vehiculos v ON v.placa = CT.placa
      LEFT JOIN bodegas b ON b.bodega = CT.bodega
      LEFT JOIN (
        SELECT * 
        FROM CRM_contactos
        WHERE contacto = 1
      ) Crm ON Crm.nit = CT.usuario
      WHERE CONVERT(DATE, CT.fecha_creacion) BETWEEN ${dateStart} AND ${dateEnd}
        AND (
          ${empresaId ?? null} IS NULL
          OR (
            (${empresaId ?? null} = 1 AND v.marca = '010') OR
            (${empresaId ?? null} = 2 AND v.marca IN ('302', '304')) OR
            (${empresaId ?? null} = 3 AND v.marca = '140') OR
            (${empresaId ?? null} = 4 AND v.marca = '303')
          )
        )
      ORDER BY CT.fecha_creacion DESC
    `;

    return rows.map<CotizacionResumen>((r: any) => ({
      id_cotizacion: Number(r.id_cotizacion),
      placa: r.placa,
      clase: r.clase,
      des_modelo: r.des_modelo,
      kilometraje_cliente: r.kilometraje_cliente != null ? Number(r.kilometraje_cliente) : null,
      revision: r.revision != null ? Number(r.revision) : null,
      bodega: r.bodega != null ? Number(r.bodega) : null,
      NomBodega: r.NomBodega ?? null,
      asesor: r.asesor ?? null,
      correo: r.correo ?? null,
      estado: r.estado != null ? Number(r.estado) : 0,
      fecha_creacion: new Date(r.fecha_creacion),
      caducidad: r.caducidad ? new Date(r.caducidad) : null,
      origen: 'livianos',
    }));
  }

  async listarCotizacionesPesados(
    dateStart: string,
    dateEnd: string,
    empresaId?: number,
  ): Promise<CotizacionResumen[]> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT 
        CT.id_cotizacion,
        CT.placa,
        CT.clase,
        CT.des_modelo,
        CT.kilometraje_cliente,
        CT.revision,
        CT.bodega,
        b.descripcion AS NomBodega,
        Crm.nombre AS asesor,
        Crm.e_mail AS correo,
        CT.estado,
        CT.fecha_creacion,
        (SELECT DATEADD(DAY,30,CONVERT(DATE,CT.fecha_creacion,23))) as caducidad
      FROM dbo.postv_cotizacion_contact_p CT
      LEFT JOIN v_vh_vehiculos v ON v.placa = CT.placa
      LEFT JOIN bodegas b ON b.bodega = CT.bodega
      LEFT JOIN (
        SELECT * 
        FROM CRM_contactos
        WHERE contacto = 1
      ) Crm ON Crm.nit = CT.usuario
      WHERE CONVERT(DATE, CT.fecha_creacion) BETWEEN ${dateStart} AND ${dateEnd}
        AND (
          ${empresaId ?? null} IS NULL
          OR (
            (${empresaId ?? null} = 1 AND v.marca = '010') OR
            (${empresaId ?? null} = 2 AND v.marca IN ('302', '304')) OR
            (${empresaId ?? null} = 3 AND v.marca = '140') OR
            (${empresaId ?? null} = 4 AND v.marca = '303')
          )
        )
      ORDER BY CT.fecha_creacion DESC
    `;

    return rows.map<CotizacionResumen>((r: any) => ({
      id_cotizacion: Number(r.id_cotizacion),
      placa: r.placa,
      clase: r.clase,
      des_modelo: r.des_modelo,
      kilometraje_cliente: r.kilometraje_cliente != null ? Number(r.kilometraje_cliente) : null,
      revision: r.revision != null ? Number(r.revision) : null,
      bodega: r.bodega != null ? Number(r.bodega) : null,
      NomBodega: r.NomBodega ?? null,
      asesor: r.asesor ?? null,
      correo: r.correo ?? null,
      estado: r.estado != null ? Number(r.estado) : 0,
      fecha_creacion: new Date(r.fecha_creacion),
      caducidad: r.caducidad ? new Date(r.caducidad) : null,
      origen: 'pesados',
    }));
  }

  async getCotizacionLivianosById(
    idCotizacion: number,
    placa: string,
  ): Promise<{
    id_cotizacion: number;
    placa: string;
    nombreCliente: string;
    emailCliente: string | null;
    correoAsesor: string | null;
    bodega: number | null;
  } | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT 
        CT.id_cotizacion,
        CT.placa,
        CT.nombreCliente,
        CT.emailCliente,
        Crm.e_mail AS correoAsesor,
        CT.bodega
      FROM dbo.postv_cotizacion_contact CT
      LEFT JOIN (
        SELECT * 
        FROM CRM_contactos
        WHERE contacto = 1
      ) Crm ON Crm.nit = CT.usuario
      WHERE CT.id_cotizacion = ${idCotizacion}
        AND CT.placa = ${placa}
    `;

    if (!rows || !rows.length) {
      return null;
    }

    const r = rows[0];
    return {
      id_cotizacion: Number(r.id_cotizacion),
      placa: r.placa,
      nombreCliente: r.nombreCliente,
      emailCliente: r.emailCliente ?? null,
      correoAsesor: r.correoAsesor ?? null,
      bodega: r.bodega != null ? Number(r.bodega) : null,
    };
  }

  async getCotizacionPesadosById(
    idCotizacion: number,
    placa: string,
  ): Promise<{
      id_cotizacion: number;
      placa: string;
      nombreCliente: string;
      emailCliente: string | null;
      correoAsesor: string | null;
      bodega: number | null;
    } | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT 
        CT.id_cotizacion,
        CT.placa,
        CT.nombreCliente,
        CT.emailCliente,
        Crm.e_mail AS correoAsesor,
        CT.bodega
      FROM dbo.postv_cotizacion_contact_p CT
      LEFT JOIN (
        SELECT * 
        FROM CRM_contactos
        WHERE contacto = 1
      ) Crm ON Crm.nit = CT.usuario
      WHERE CT.id_cotizacion = ${idCotizacion}
        AND CT.placa = ${placa}
    `;

    if (!rows || !rows.length) {
      return null;
    }

    const r = rows[0];
    return {
      id_cotizacion: Number(r.id_cotizacion),
      placa: r.placa,
      nombreCliente: r.nombreCliente,
      emailCliente: r.emailCliente ?? null,
      correoAsesor: r.correoAsesor ?? null,
      bodega: r.bodega != null ? Number(r.bodega) : null,
    };
  }

  async actualizarEstadoCotizacionLivianos(idCotizacion: number): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE dbo.postv_cotizacion_contact
      SET estado = 1
      WHERE id_cotizacion = ${idCotizacion}
    `;
  }

  async actualizarEstadoCotizacionPesados(idCotizacion: number): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE dbo.postv_cotizacion_contact_p
      SET estado = 1
      WHERE id_cotizacion = ${idCotizacion}
    `;
  }

  async getEmailBodegaByNit(nit: number): Promise<string | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT TOP (1) e_mail
      FROM CRM_contactos
      WHERE nit = ${nit}
    `;

    if (!rows || !rows.length) {
      return null;
    }

    const r = rows[0];
    return r.e_mail ?? null;
  }

  async getCotizacionLivianosPdf(
    idCotizacion: number,
    placa: string,
  ): Promise<CotizacionPdfGeneral | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        CT.id_cotizacion,
        CT.placa,
        CT.nombreCliente,
        CT.nitCliente,
        CT.des_modelo,
        CT.revision,
        CT.observaciones,
        CT.fecha_creacion,
        b.descripcion AS NomBodega,
        b.direccion,
        b.telefono,
        Crm.nombre AS asesor,
        Crm.e_mail AS correo,
        CASE WHEN Crm.tel_celular IS NOT NULL THEN Crm.tel_celular ELSE t.celular END AS telAsesor
      FROM dbo.postv_cotizacion_contact CT
      LEFT JOIN bodegas b ON b.bodega = CT.bodega
      LEFT JOIN terceros t ON t.nit = CT.usuario
      LEFT JOIN (SELECT * FROM CRM_contactos WHERE contacto = 1) Crm ON Crm.nit = CT.usuario
      WHERE CT.id_cotizacion = ${idCotizacion} AND CT.placa = ${placa}
    `;

    if (!rows?.length) return null;
    const r = rows[0];
    return this.mapRowToCotizacionPdfGeneral(r);
  }

  async getRepuestosCotiLivianos(idCotizacion: number): Promise<CotizacionRepuestoRow[]> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT codigo, descripcion, categoria, estado, valor
      FROM dbo.postv_cotizacion_repuestos
      WHERE id_cotizacion = ${idCotizacion}
      ORDER BY categoria ASC, descripcion ASC
    `;
    return (rows ?? []).map((row: any) => {
      const rawCategoria = row.categoria != null ? String(row.categoria) : null;
      const categoriaNormalizada =
        rawCategoria && rawCategoria.trim().toUpperCase() === 'CODIESEL'
          ? null
          : rawCategoria;
      return {
        codigo: String(row.codigo ?? ''),
        descripcion: String(row.descripcion ?? ''),
        categoria: categoriaNormalizada,
        estado: Number(row.estado ?? 0),
        valor: Number(row.valor ?? 0),
      };
    });
  }

  async getMttoCotiLivianos(idCotizacion: number): Promise<CotizacionMttoRow[]> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT mtto, estado, valor, cant_horas
      FROM dbo.postv_cotizacion_mtto
      WHERE id_cotizacion = ${idCotizacion}
      ORDER BY estado DESC
    `;
    return (rows ?? []).map((row: any) => ({
      mtto: String(row.mtto ?? ''),
      estado: Number(row.estado ?? 0),
      valor: Number(row.valor ?? 0),
      cant_horas: Number(row.cant_horas ?? 0),
    }));
  }

  async getCotizacionPesadosPdf(
    idCotizacion: number,
    placa: string,
  ): Promise<CotizacionPdfGeneral | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        CT.id_cotizacion,
        CT.placa,
        CT.nombreCliente,
        CT.nitCliente,
        CT.des_modelo,
        CT.revision,
        CT.observaciones,
        CT.fecha_creacion,
        b.descripcion AS NomBodega,
        b.direccion,
        b.telefono,
        Crm.nombre AS asesor,
        Crm.e_mail AS correo,
        CASE WHEN Crm.tel_celular IS NOT NULL THEN Crm.tel_celular ELSE t.celular END AS telAsesor
      FROM dbo.postv_cotizacion_contact_p CT
      LEFT JOIN bodegas b ON b.bodega = CT.bodega
      LEFT JOIN terceros t ON t.nit = CT.usuario
      LEFT JOIN (SELECT * FROM CRM_contactos WHERE contacto = 1) Crm ON Crm.nit = CT.usuario
      WHERE CT.id_cotizacion = ${idCotizacion} AND CT.placa = ${placa}
    `;

    if (!rows?.length) return null;
    return this.mapRowToCotizacionPdfGeneral(rows[0]);
  }

  async getRepuestosCotiPesados(idCotizacion: number): Promise<CotizacionRepuestoRow[]> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT codigo, descripcion, categoria, estado, valor
      FROM dbo.postv_cotizacion_repuestos_p
      WHERE id_cotizacion = ${idCotizacion}
      ORDER BY estado DESC
    `;
    return (rows ?? []).map((row: any) => {
      const rawCategoria = row.categoria != null ? String(row.categoria) : null;
      const categoriaNormalizada =
        rawCategoria && rawCategoria.trim().toUpperCase() === 'CODIESEL'
          ? null
          : rawCategoria;
      return {
        codigo: String(row.codigo ?? ''),
        descripcion: String(row.descripcion ?? ''),
        categoria: categoriaNormalizada,
        estado: Number(row.estado ?? 0),
        valor: Number(row.valor ?? 0),
      };
    });
  }

  async getMttoCotiPesados(idCotizacion: number): Promise<CotizacionMttoRow[]> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT descripcion AS mtto, estado, valor, cant_horas
      FROM dbo.postv_cotizacion_mtto_p
      WHERE id_cotizacion = ${idCotizacion}
      ORDER BY estado DESC
    `;
    return (rows ?? []).map((row: any) => ({
      mtto: String(row.mtto ?? ''),
      estado: Number(row.estado ?? 0),
      valor: Number(row.valor ?? 0),
      cant_horas: Number(row.cant_horas ?? 0),
    }));
  }

  private mapRowToCotizacionPdfGeneral(r: any): CotizacionPdfGeneral {
    return {
      id_cotizacion: Number(r.id_cotizacion),
      placa: String(r.placa ?? ''),
      nombreCliente: String(r.nombreCliente ?? ''),
      nitCliente: r.nitCliente != null ? String(r.nitCliente) : null,
      des_modelo: r.des_modelo != null ? String(r.des_modelo) : null,
      revision: r.revision != null ? Number(r.revision) : null,
      observaciones: r.observaciones != null ? String(r.observaciones) : '',
      fecha_creacion: new Date(r.fecha_creacion),
      NomBodega: r.NomBodega != null ? String(r.NomBodega) : null,
      direccion: r.direccion != null ? String(r.direccion) : null,
      telefono: r.telefono != null ? String(r.telefono) : null,
      asesor: r.asesor != null ? String(r.asesor) : null,
      correo: r.correo != null ? String(r.correo) : null,
      telAsesor: r.telAsesor != null ? String(r.telAsesor) : null,
    };
  }
}

