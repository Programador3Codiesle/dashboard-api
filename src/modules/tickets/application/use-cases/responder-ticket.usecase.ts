
import { Injectable, NotFoundException } from '@nestjs/common';
import { ITicketRepository } from '../../domain/ticket.repository';
import { CreateRespuestaDto } from '../dto/create-ticket.dto';
import { reponderTicketDto } from '../dto/update-ticket.dto';

@Injectable()
export class ResponderTicketUseCase {
    constructor(private readonly repo: ITicketRepository) { }

    async execute(ticketId: number, dto: reponderTicketDto) {
        const ticket = await this.repo.findById(ticketId);
        if (!ticket) throw new NotFoundException('Ticket no encontrado');

        // Obtener la respuesta actual del ticket
        const respuestaActual = await this.repo.getRespuestaActual(ticketId);
        
        // Formatear la nueva respuesta: NOMBRE: respuesta,
        const nombre = dto.nombre.toUpperCase();
        const nuevaRespuesta = `${nombre}: ${dto.respuesta},`;
        
        // Concatenar con la respuesta existente si existe
        const respuestaFormateada = respuestaActual 
            ? `${respuestaActual}${nuevaRespuesta}` 
            : nuevaRespuesta;

        
        // Si dto.estado viene vacío, null o indefinido, asignar "En Proceso"
        if (!dto.estado || dto.estado.trim() === '') {
            dto.estado = 'En Proceso';
        }

        // Preparar los datos para el repositorio
        const dataRespuesta = {
            respuesta: respuestaFormateada,
            estado: dto.estado,
            fecha_respuesta: dto.fecha_respuesta || new Date(),
        };

        return this.repo.addRespuesta(ticketId, dataRespuesta);
    }

    async getRespuestas(ticketId: number) {
        return this.repo.getRespuestas(ticketId);
    }
}


