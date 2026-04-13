import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  IGestionCompraRepository,
  ListarComprasResult,
  MensajeCompra,
} from '../../domain/gestion-compra.repository';
import { GestionCompraEntity } from '../../domain/gestion-compra.entity';

@Injectable()
export class GestionCompraPrismaRepository implements IGestionCompraRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Partial<GestionCompraEntity>,
  ): Promise<{ status: boolean; message: string; data?: GestionCompraEntity }> {
    const fechaSolicitud =
      data.fecha_solicitud?.toISOString().split('T')[0] ||
      new Date().toISOString().split('T')[0];
    const fechaTentativa =
      data.fecha_tentativa?.toISOString().split('T')[0] ||
      new Date().toISOString().split('T')[0];

    const tryInsert = async (includeIdEmpresa: boolean) => {
      if (includeIdEmpresa && data.id_empresa != null) {
        return this.prisma.$queryRaw<any[]>`
                    INSERT INTO postv_gestion_compras 
                    (fecha_solicitud, area, sede, usu_solicita, cargo_usu_solicita, gerente_autoriza,
                     descri_prod, caracteristicas, proveedor, area_cargar, urgencia, fecha_tentativa,
                     estado, estado_autorizacion, con_factura, id_empresa)
                    OUTPUT INSERTED.*
                    VALUES 
                    (${fechaSolicitud}, ${data.area}, ${data.sede}, ${data.usu_solicita},
                     ${data.cargo_usu_solicita}, ${data.gerente_autoriza ?? null}, ${data.descri_prod},
                     ${data.caracteristicas ?? ''},
                     ${data.proveedor ?? null},
                     ${data.area_cargar ?? null},
                     ${data.urgencia}, ${fechaTentativa}, ${data.estado || 1},
                     ${data.estado_autorizacion || 0}, ${data.con_factura ?? null}, ${data.id_empresa})
                `;
      }
      return this.prisma.$queryRaw<any[]>`
                INSERT INTO postv_gestion_compras 
                (fecha_solicitud, area, sede, usu_solicita, cargo_usu_solicita, gerente_autoriza,
                 descri_prod, caracteristicas, proveedor, area_cargar, urgencia, fecha_tentativa,
                 estado, estado_autorizacion, con_factura)
                OUTPUT INSERTED.*
                VALUES 
                (${fechaSolicitud}, ${data.area}, ${data.sede}, ${data.usu_solicita},
                 ${data.cargo_usu_solicita}, ${data.gerente_autoriza ?? null}, ${data.descri_prod},
                 ${data.caracteristicas ?? ''},
                 ${data.proveedor ?? null},
                 ${data.area_cargar ?? null},
                 ${data.urgencia}, ${fechaTentativa}, ${data.estado || 1},
                 ${data.estado_autorizacion || 0}, ${data.con_factura ?? null})
            `;
    };

    try {
      let result: any[];
      try {
        result = await tryInsert(true);
      } catch (firstErr: any) {
        const msg = firstErr?.message ?? String(firstErr);
        if (msg.includes('id_empresa') || msg.includes('Invalid column name')) {
          result = await tryInsert(false);
        } else {
          throw firstErr;
        }
      }

      const inserted = result[0];
      return {
        status: true,
        message: 'Solicitud de compra creada correctamente',
        data: this.mapToEntity(inserted),
      };
    } catch (error: any) {
      return {
        status: false,
        message:
          'Error al crear solicitud: ' +
          (error instanceof Error ? error.message : 'Error desconocido'),
      };
    }
  }

  async listar(filtros?: any): Promise<ListarComprasResult> {
    try {
      // Optimizado: Usar Prisma.sql para construir queries seguras
      const conditions: Prisma.Sql[] = [Prisma.sql`1=1`];

      if (filtros?.buscar) {
        const searchTerm = '%' + filtros.buscar + '%';
        conditions.push(
          Prisma.sql`(gc.descri_prod LIKE ${searchTerm} OR gc.area LIKE ${searchTerm} OR us.nombres LIKE ${searchTerm})`,
        );
      }

      if (filtros?.usu_solicita) {
        conditions.push(Prisma.sql`gc.usu_solicita = ${filtros.usu_solicita}`);
      }

      if (filtros?.estado !== undefined) {
        conditions.push(Prisma.sql`gc.estado = ${filtros.estado}`);
      }

      if (filtros?.estado_autorizacion !== undefined) {
        conditions.push(
          Prisma.sql`gc.estado_autorizacion = ${filtros.estado_autorizacion}`,
        );
      }

      const whereClause = Prisma.join(conditions, ' AND ');
      const limit = filtros?.limite || 10;
      const page = filtros?.pagina || 1;
      const offset = (page - 1) * limit;

      // Contar total de registros (LEFT JOIN gerente: permite gerente_autoriza NULL)
      const totalResult = await this.prisma.$queryRaw<[{ total: bigint }]>`
                SELECT COUNT(*) as total
                FROM postv_gestion_compras gc 
                INNER JOIN terceros us ON us.nit = gc.usu_solicita
                LEFT JOIN terceros ga ON ga.nit = gc.gerente_autoriza
                WHERE ${whereClause}
            `;
      const total = Number(totalResult[0].total);

      // Obtener items paginados (LEFT JOIN gerente: permite gerente_autoriza NULL)
      const results = await this.prisma.$queryRaw<any[]>`
                SELECT 
                    gc.id_solicitud, gc.fecha_solicitud, gc.area, gc.sede, gc.usu_solicita, 
                    gc.cargo_usu_solicita, gc.gerente_autoriza, gc.descri_prod, gc.caracteristicas, 
                    gc.proveedor, gc.area_cargar, gc.urgencia, gc.fecha_tentativa, gc.estado, 
                    gc.fecha_autorizacion, gc.cotizacion_file, gc.estado_autorizacion, gc.con_factura, gc.id_empresa,
                    us.nombres as usuario_reg, us.nit as nit_usu_reg,
                    ga.nombres as gerente, ga.nit as nit_gerente,
                    DATEDIFF(DAY, CONVERT(DATE, gc.fecha_solicitud), CONVERT(DATE, GETDATE())) as dias_gest
                FROM postv_gestion_compras gc 
                INNER JOIN terceros us ON us.nit = gc.usu_solicita
                LEFT JOIN terceros ga ON ga.nit = gc.gerente_autoriza
                WHERE ${whereClause}
                ORDER BY gc.estado ASC, gc.fecha_solicitud DESC
                OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
            `;

      return {
        items: results.map((r) => ({
          ...this.mapToEntity(r),
          // Campos adicionales del JOIN que vienen como strings/numbers
          usuario_reg: r.usuario_reg || undefined,
          nit_usu_reg: r.nit_usu_reg ? Number(r.nit_usu_reg) : undefined,
          gerente: r.gerente || undefined,
          nit_gerente: r.nit_gerente ? Number(r.nit_gerente) : undefined,
          dias_gest: r.dias_gest ? Number(r.dias_gest) : undefined,
        })),
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error listando compras:', error);
      return { items: [], total: 0, page: 1, limit: 10 };
    }
  }

  async findById(id: bigint): Promise<GestionCompraEntity | null> {
    try {
      // Optimizado: Usar $queryRaw con parámetro seguro
      const result = await this.prisma.$queryRaw<any[]>`
                SELECT 
                    id_solicitud, fecha_solicitud, area, sede, usu_solicita, 
                    cargo_usu_solicita, gerente_autoriza, descri_prod, caracteristicas, 
                    proveedor, area_cargar, urgencia, fecha_tentativa, estado, 
                    fecha_autorizacion, cotizacion_file, estado_autorizacion, con_factura, id_empresa
                FROM postv_gestion_compras
                WHERE id_solicitud = ${id}
            `;

      if (!result || result.length === 0) return null;

      return this.mapToEntity(result[0]);
    } catch (error) {
      console.error('Error buscando compra:', error);
      return null;
    }
  }

  async cambiarEstado(
    id: bigint,
    estado: number,
    estadoAutorizacion?: number,
  ): Promise<boolean> {
    try {
      const idNum = Number(id);
      if (estadoAutorizacion !== undefined && estadoAutorizacion !== null) {
        const count = await this.prisma.$executeRaw`
                    UPDATE postv_gestion_compras
                    SET estado = ${estado}, estado_autorizacion = ${estadoAutorizacion}
                    WHERE id_solicitud = ${idNum}
                `;
        return Number(count) > 0;
      }
      const count = await this.prisma.$executeRaw`
                UPDATE postv_gestion_compras
                SET estado = ${estado}
                WHERE id_solicitud = ${idNum}
            `;
      return Number(count) > 0;
    } catch (error) {
      console.error('Error cambiando estado:', error);
      return false;
    }
  }

  async marcarConFactura(id: bigint, conFactura: string): Promise<boolean> {
    try {
      await this.prisma.$executeRaw`
                UPDATE postv_gestion_compras
                SET con_factura = ${conFactura}
                WHERE id_solicitud = ${id}
            `;
      return true;
    } catch (error) {
      console.error('Error marcando con factura:', error);
      return false;
    }
  }

  async crearMensaje(
    solicitudId: bigint,
    nitUsuario: number,
    mensaje: string,
  ): Promise<boolean> {
    try {
      const fecha = new Date().toISOString();
      await this.prisma.$executeRaw`
                INSERT INTO postv_msn_gestion_compras 
                (nit_usu, mensaje, fecha, solicitud_compra)
                VALUES 
                (${nitUsuario}, ${mensaje}, ${fecha}, ${solicitudId})
            `;
      return true;
    } catch (error) {
      console.error('Error creando mensaje:', error);
      return false;
    }
  }

  async listarMensajes(solicitudId: bigint): Promise<MensajeCompra[]> {
    try {
      const results = await this.prisma.$queryRaw<any[]>`
                SELECT 
                    mgc.id_msn AS id_mensaje, mgc.nit_usu, mgc.mensaje, mgc.fecha, mgc.solicitud_compra,
                    t.nombres
                FROM postv_msn_gestion_compras mgc
                INNER JOIN terceros t ON t.nit = mgc.nit_usu
                WHERE mgc.solicitud_compra = ${solicitudId}
                ORDER BY mgc.fecha ASC
            `;
      return results.map((r) => ({
        id_mensaje: BigInt(r.id_mensaje),
        nit_usu: Number(r.nit_usu),
        nombres: r.nombres,
        mensaje: r.mensaje,
        fecha: new Date(r.fecha),
        solicitud_compra: BigInt(r.solicitud_compra),
      }));
    } catch (error) {
      console.error('Error listando mensajes:', error);
      return [];
    }
  }

  async enviarAutorizacion(
    solicitudId: bigint,
    comentarios: string,
    archivos: string[],
  ): Promise<boolean> {
    try {
      // Actualizar estado de autorización a "Pendiente" (2) y estado a "En proceso" (2)
      await this.prisma.$executeRaw`
                UPDATE postv_gestion_compras
                SET estado_autorizacion = 2, estado = 2
                WHERE id_solicitud = ${solicitudId}
            `;

      // Insertar archivos de cotización si existen
      if (archivos && archivos.length > 0) {
        for (const archivo of archivos) {
          await this.prisma.$executeRaw`
                        INSERT INTO postv_cotizaciones_gest_compras 
                        (id_compra, url, estado)
                        VALUES 
                        (${solicitudId}, ${archivo}, 0)
                    `;
        }
      }

      return true;
    } catch (error) {
      console.error('Error enviando autorización:', error);
      return false;
    }
  }

  async getEmailByNit(nit: number): Promise<string | null> {
    try {
      const result = await this.prisma.$queryRaw<any[]>`
                SELECT mail FROM terceros WHERE (nit = ${nit} OR nit_real = ${nit}) AND mail IS NOT NULL AND LTRIM(RTRIM(ISNULL(mail, ''))) <> ''
            `;
      if (!result || result.length === 0) return null;
      const row = result[0];
      const mail = row?.mail ?? row?.Mail;
      const email = typeof mail === 'string' ? mail.trim() : null;
      return email && email.length > 0 ? email : null;
    } catch (error) {
      console.error('Error obteniendo email por NIT:', error);
      return null;
    }
  }

  private mapToEntity(data: any): GestionCompraEntity {
    return new GestionCompraEntity({
      id_solicitud: BigInt(data.id_solicitud),
      fecha_solicitud: new Date(data.fecha_solicitud),
      area: data.area,
      sede: data.sede,
      usu_solicita: Number(data.usu_solicita),
      cargo_usu_solicita: data.cargo_usu_solicita,
      gerente_autoriza: Number(data.gerente_autoriza),
      descri_prod: data.descri_prod,
      caracteristicas: data.caracteristicas,
      proveedor: data.proveedor,
      area_cargar: data.area_cargar,
      urgencia: Number(data.urgencia),
      fecha_tentativa: new Date(data.fecha_tentativa),
      estado: Number(data.estado),
      fecha_autorizacion: data.fecha_autorizacion
        ? new Date(data.fecha_autorizacion)
        : null,
      cotizacion_file: data.cotizacion_file,
      estado_autorizacion: Number(data.estado_autorizacion),
      con_factura: data.con_factura,
      id_empresa: data.id_empresa != null ? Number(data.id_empresa) : null,
    });
  }
}
