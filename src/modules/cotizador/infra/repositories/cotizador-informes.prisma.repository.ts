import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import {
  CotizacionResumen,
  ICotizadorInformesRepository,
} from '../../domain/cotizador-informes.repository';

@Injectable()
export class CotizadorInformesPrismaRepository implements ICotizadorInformesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listarCotizacionesLivianos(dateStart: string, dateEnd: string): Promise<CotizacionResumen[]> {
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
      LEFT JOIN bodegas b ON b.bodega = CT.bodega
      LEFT JOIN (
        SELECT * 
        FROM CRM_contactos
        WHERE contacto = 1
      ) Crm ON Crm.nit = CT.usuario
      WHERE CONVERT(DATE, CT.fecha_creacion) BETWEEN ${dateStart} AND ${dateEnd}
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

  async listarCotizacionesPesados(dateStart: string, dateEnd: string): Promise<CotizacionResumen[]> {
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
      LEFT JOIN bodegas b ON b.bodega = CT.bodega
      LEFT JOIN (
        SELECT * 
        FROM CRM_contactos
        WHERE contacto = 1
      ) Crm ON Crm.nit = CT.usuario
      WHERE CONVERT(DATE, CT.fecha_creacion) BETWEEN ${dateStart} AND ${dateEnd}
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
}

