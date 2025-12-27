
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import { ITicketRepository } from '../../domain/ticket.repository';
import { TicketEntity, RespuestaTicketEntity } from '../../domain/ticket.entity';
import { TicketsMapper } from '../../presentation/mappers/tickets.mapper';

@Injectable()
export class TicketPrismaRepository implements ITicketRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: Partial<TicketEntity>): Promise<{status: boolean, message: string, data: TicketEntity | null}> {
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
                    area: "sistemas",
                }
            });
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
                })
            };
        } catch (error) {
            return {
                status: false,
                message: 'Error al crear el ticket: ' + (error instanceof Error ? error.message : 'Error desconocido'),
                data: null
            };
        }
    }

    async update(id: number, data: Partial<TicketEntity>): Promise<{status: boolean, message: string}> {
       
        const updateData: any = {};

        if (data.encargado_id !== undefined) updateData.encargado = data.encargado_id;
        if (data.prioridad !== undefined) updateData.prioridad = data.prioridad;

        try {
            const result = await this.prisma.tickets.update({
                where: { id_ticket: id },
                data: updateData
            });
            if (!result) return {
                status: false,
                message: 'Error al actualizar el ticket'
            };
            return {
                status: true,
                message: 'Ticket actualizado correctamente'
            };
        } catch (error) {
            return {
                status: false,
                message: 'Error al actualizar el ticket: ' + error.message
            };
        }
    }

    async findById(id: number): Promise<TicketEntity | null> {
        console.log(id);
        const result = await this.prisma.tickets.findUnique({
            where: { id_ticket: id }
        });
        if (!result) return null;
        // @ts-ignore
        return new TicketEntity({
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
            respuestas: result.respuesta || undefined,
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
                tk.estado
            FROM tickets tk
            LEFT JOIN terceros us ON us.nit_real = tk.usuario
            LEFT JOIN terceros en ON en.nit_real = tk.encargado
            WHERE tk.usuario = ${userId}
            ORDER BY tk.fecha_creacion DESC;
        `;

        return results.map(r => TicketsMapper.mapToEntity(r));
    }



    async findActivos(): Promise<TicketEntity[]> {
        const sql = `SELECT 
                        tk.usuario, 
                        tk.prioridad, 
                        tk.id_ticket as id, 
                        tk.tipo_soporte, 
                        en.nombres AS nombre_encargado, 
                        us.nombres AS nombre_usuario, 
                        tk.fecha_creacion, 
                        tk.estado,
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
                    ORDER BY tk.fecha_creacion DESC;
        `;

        const results = await this.prisma.$queryRawUnsafe<any[]>(sql);

        return results.map(r => TicketsMapper.mapToEntity(r));
    }



    async findFinalizados(): Promise<TicketEntity[]> {
        const sql = `SELECT 
                        tk.usuario, 
                        tk.prioridad, 
                        tk.id_ticket AS id, 
                        tk.tipo_soporte, 
                        en.nombres AS nombre_encargado, 
                        us.nombres AS nombre_usuario, 
                        tk.fecha_creacion, 
                        tk.estado
                    FROM tickets tk
                    LEFT JOIN terceros us ON us.nit_real = tk.usuario
                    LEFT JOIN terceros en ON en.nit_real = tk.encargado
                    WHERE tk.estado IN ('cerrado')
                        AND tk.fecha_creacion >= DATEADD(year, -1, GETDATE())
                    ORDER BY tk.fecha_creacion DESC;
        `;

        const results = await this.prisma.$queryRawUnsafe<any[]>(sql);
        console.log(results);


        return results.map(r => TicketsMapper.mapToEntity(r));
    }

    async getRespuestaActual(ticketId: number): Promise<string | null> {
        const result = await this.prisma.tickets.findUnique({
            where: { id_ticket: ticketId },
            select: { respuesta: true }
        });
        return result?.respuesta || null;
    }

    async addRespuesta(ticket: number, data: Partial<RespuestaTicketEntity>): Promise<{status: boolean, message: string}> {
        try {
            console.log(data);
            const updateData: any = {};

            if (data.respuesta !== undefined) updateData.respuesta = data.respuesta;
            if (data.fecha_respuesta !== undefined) updateData.fecha_respuesta = data.fecha_respuesta;
            if (data.estado !== undefined) updateData.estado = data.estado;

            console.log(updateData);

            await this.prisma.tickets.update({
                where: { id_ticket: ticket },
                data: updateData
            });

            return {
                status: true,
                message: 'Respuesta exitosa'
            };
        } catch (error) {
            console.error(error);
            return {
                status: false,
                message: 'Error al agregar la respuesta ' + error.message
            };
        }
    }

    async getRespuestas(ticketId: number): Promise<RespuestaTicketEntity[]> {
        const results = await this.prisma.respuestaTicket.findMany({
            where: { ticket_id: ticketId },
            orderBy: { fecha: 'asc' }
        });
        // @ts-ignore
        return results.map(r => new RespuestaTicketEntity(r));
    }
}
