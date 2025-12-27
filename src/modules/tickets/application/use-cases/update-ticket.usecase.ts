
import { Injectable, NotFoundException } from '@nestjs/common';
import { ITicketRepository } from '../../domain/ticket.repository';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { ReasignarTicketDto } from '../dto/create-ticket.dto';

@Injectable()
export class UpdateTicketUseCase {
    constructor(private readonly repo: ITicketRepository) { }



    async reasignar(id: number, dto: ReasignarTicketDto) {
        const ticket = await this.repo.findById(id);
        if (!ticket) throw new NotFoundException('Ticket no encontrado');
        return this.repo.update(id, { encargado_id: dto.encargado_id, prioridad: dto.prioridad });
    }
}
