import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import {
  ITicketRepository,
  TicketEmailContext,
} from '../../domain/ticket.repository';
import {
  TicketEntity,
  RespuestaTicketEntity,
} from '../../domain/ticket.entity';
import { TicketsMapper } from '../../presentation/mappers/tickets.mapper';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

@Injectable()
export class TicketPrismaRepository implements ITicketRepository {
  private readonly logger = new Logger(TicketPrismaRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Partial<TicketEntity>,
  ): Promise<{ status: boolean; message: string; data: TicketEntity | null }> {
    try {
      const result = await this.prisma.tickets.create({
        data: {
          tipo_soporte: data.tipo_soporte!,
          anydesk: data.anydesk,
          descripcion: data.descripcion!,
          img: data.archivo_url,
          prioridad: data.prioridad!,
          estado: data.estado || 'Activo',
          usuario: +data.usuario_id!,
          encargado: data.encargado_id,
          fecha_creacion: new Date(),
          area: 'sistemas',
        },
      });
      await this.prisma.$executeRaw`
        UPDATE tickets
        SET sede = ${data.sede ?? ''}
        WHERE id_ticket = ${result.id_ticket}
      `;
      // @ts-ignore
      return {
        status: true,
        message: 'Ticket creado correctamente',
        data: new TicketEntity({
          id: Number(result.id_ticket),
          tipo_soporte: result.tipo_soporte,
          descripcion: result.descripcion || '',
          prioridad: result.prioridad || '',
          estado: result.estado,
          fecha_creacion: result.fecha_creacion || new Date(),
          usuario_id: Number(result.usuario),
          encargado_id: result.encargado ? Number(result.encargado) : undefined,
          anydesk: result.anydesk || undefined,
          archivo_url: result.img || undefined,
          sede: data.sede || undefined,
          extension: data.extension || undefined,
        }),
      };
    } catch (error) {
      return {
        status: false,
        message:
          'Error al crear el ticket: ' +
          (error instanceof Error ? error.message : 'Error desconocido'),
        data: null,
      };
    }
  }

  async update(
    id: number,
    data: Partial<TicketEntity>,
  ): Promise<{ status: boolean; message: string }> {
    const updateData: any = {};

    if (data.encargado_id !== undefined)
      updateData.encargado = data.encargado_id;
    if (data.prioridad !== undefined) updateData.prioridad = data.prioridad;

    try {
      const result = await this.prisma.tickets.update({
        where: { id_ticket: id },
        data: updateData,
      });
      if (!result)
        return {
          status: false,
          message: 'Error al actualizar el ticket',
        };
      return {
        status: true,
        message: 'Ticket actualizado correctamente',
      };
    } catch (error: any) {
      return {
        status: false,
        message: 'Error al actualizar el ticket: ' + error.message,
      };
    }
  }

  async findById(id: number): Promise<TicketEntity | null> {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT TOP 1
        tk.id_ticket,
        tk.tipo_soporte,
        tk.descripcion,
        tk.prioridad,
        tk.estado,
        tk.fecha_creacion,
        tk.usuario,
        tk.encargado,
        tk.anydesk,
        tk.img,
        tk.respuesta,
        tk.sede,
        CAST(NULL AS varchar(50)) AS extension
      FROM tickets tk
      WHERE tk.id_ticket = ${id}
    `;
    const row = result[0];
    if (!row) return null;
    return new TicketEntity({
      id: Number(row.id_ticket),
      tipo_soporte: row.tipo_soporte,
      descripcion: row.descripcion || '',
      prioridad: row.prioridad || '',
      estado: row.estado,
      fecha_creacion: row.fecha_creacion || new Date(),
      usuario_id: Number(row.usuario),
      encargado_id: row.encargado ? Number(row.encargado) : undefined,
      anydesk: row.anydesk || undefined,
      archivo_url: row.img || undefined,
      respuestas: row.respuesta || undefined,
      sede: row.sede || undefined,
      extension: row.extension || undefined,
    });
  }

  async findByUsuario(userId: number): Promise<TicketEntity[]> {
    const results = await this.prisma.$queryRaw<any[]>`
            SELECT 
                tk.usuario, 
                tk.prioridad, 
                tk.id_ticket AS id, 
                tk.tipo_soporte, 
                en.nombres AS nombre_encargado, 
                us.nombres AS nombre_usuario, 
                tk.fecha_creacion, 
                tk.estado,
                tk.sede,
                CAST(NULL AS varchar(50)) AS extension
            FROM tickets tk
            LEFT JOIN terceros us ON us.nit_real = tk.usuario
            LEFT JOIN terceros en ON en.nit_real = tk.encargado
            WHERE tk.usuario = ${userId}
            ORDER BY tk.fecha_creacion DESC;
        `;

    return results.map((r) => TicketsMapper.mapToEntity(r));
  }

  async findActivos(
    page: number = DEFAULT_PAGE,
    limit: number = DEFAULT_LIMIT,
  ): Promise<TicketEntity[]> {
    const offset = (page - 1) * limit;
    const results = await this.prisma.$queryRaw<any[]>`
            SELECT 
                tk.usuario, 
                tk.prioridad, 
                tk.id_ticket as id, 
                tk.tipo_soporte, 
                en.nombres AS nombre_encargado, 
                us.nombres AS nombre_usuario, 
                tk.fecha_creacion, 
                tk.estado,
                tk.sede,
                CAST(NULL AS varchar(50)) AS extension,
                STUFF((
                    SELECT ', ' + CAST(em2.idEmpresa AS VARCHAR(10))
                    FROM sw_empresa_usuario em2
                    WHERE em2.idUsuario = tk.usuario
                    FOR XML PATH(''), TYPE
                ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS idEmpresas  
            FROM tickets tk
            LEFT JOIN terceros us ON us.nit_real = tk.usuario
            LEFT JOIN terceros en ON en.nit_real = tk.encargado
            WHERE 1 = 1
                AND tk.estado IN ('activo', 'En Proceso')
            ORDER BY tk.fecha_creacion DESC
            OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
        `;

    return results.map((r) => TicketsMapper.mapToEntity(r));
  }

  async findFinalizados(
    page: number = DEFAULT_PAGE,
    limit: number = DEFAULT_LIMIT,
  ): Promise<TicketEntity[]> {
    const offset = (page - 1) * limit;
    const results = await this.prisma.$queryRaw<any[]>`
            SELECT 
                tk.usuario, 
                tk.prioridad, 
                tk.id_ticket AS id, 
                tk.tipo_soporte, 
                en.nombres AS nombre_encargado, 
                us.nombres AS nombre_usuario, 
                tk.fecha_creacion, 
                tk.estado,
                tk.sede,
                CAST(NULL AS varchar(50)) AS extension
            FROM tickets tk
            LEFT JOIN terceros us ON us.nit_real = tk.usuario
            LEFT JOIN terceros en ON en.nit_real = tk.encargado
            WHERE tk.estado IN ('cerrado')
                AND tk.fecha_creacion >= DATEADD(year, -1, GETDATE())
            ORDER BY tk.fecha_creacion DESC
            OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
        `;

    return results.map((r) => TicketsMapper.mapToEntity(r));
  }

  async getRespuestaActual(ticketId: number): Promise<string | null> {
    const result = await this.prisma.tickets.findUnique({
      where: { id_ticket: ticketId },
      select: { respuesta: true },
    });
    return result?.respuesta || null;
  }

  async addRespuesta(
    ticket: number,
    data: Partial<RespuestaTicketEntity>,
  ): Promise<{ status: boolean; message: string }> {
    try {
      const updateData: any = {};

      if (data.respuesta !== undefined) updateData.respuesta = data.respuesta;
      if (data.fecha_respuesta !== undefined)
        updateData.fecha_respuesta = data.fecha_respuesta;
      if (data.estado !== undefined) updateData.estado = data.estado;

      await this.prisma.tickets.update({
        where: { id_ticket: ticket },
        data: updateData,
      });

      return {
        status: true,
        message: 'Respuesta exitosa',
      };
    } catch (error: any) {
      this.logger.error('Error al agregar la respuesta', error?.stack || error);
      return {
        status: false,
        message: 'Error al agregar la respuesta ' + error.message,
      };
    }
  }

  async getRespuestas(ticketId: number): Promise<RespuestaTicketEntity[]> {
    const results = await this.prisma.respuestaTicket.findMany({
      where: { ticket_id: ticketId },
      orderBy: { fecha: 'asc' },
    });
    // @ts-ignore
    return results.map((r) => new RespuestaTicketEntity(r));
  }

  async getTicketEmailContext(
    ticketId: number,
  ): Promise<TicketEmailContext | null> {
    const result = await this.prisma.$queryRaw<
      Array<{
        id_ticket: number;
        descripcion: string | null;
        respuesta: string | null;
        correo_usuario: string | null;
        correo_encargado: string | null;
      }>
    >`
      SELECT TOP 1
        tk.id_ticket,
        tk.descripcion,
        tk.respuesta,
        cu.e_mail AS correo_usuario,
        ce.e_mail AS correo_encargado
      FROM tickets tk
      LEFT JOIN CRM_contactos cu ON cu.nit = tk.usuario
      LEFT JOIN CRM_contactos ce ON ce.nit = tk.encargado
      WHERE tk.id_ticket = ${ticketId}
      ORDER BY tk.fecha_creacion DESC
    `;

    const row = result[0];
    if (!row) return null;

    return {
      id_ticket: Number(row.id_ticket),
      descripcion: row.descripcion || 'Ticket sin asunto',
      respuesta: row.respuesta,
      correo_usuario: row.correo_usuario,
      correo_encargado: row.correo_encargado,
    };
  }
}
