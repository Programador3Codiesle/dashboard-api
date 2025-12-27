
import { Injectable } from '@nestjs/common';
import { CreateTicketUseCase } from './use-cases/create-ticket.usecase';
import { UpdateTicketUseCase } from './use-cases/update-ticket.usecase';
import { GetTicketsUseCase } from './use-cases/get-tickets.usecase';
import { ResponderTicketUseCase } from './use-cases/responder-ticket.usecase';
import { CreateTicketDto, CreateRespuestaDto, ReasignarTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto, reponderTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketFacade {
    constructor(
        private readonly createUC: CreateTicketUseCase,
        private readonly updateUC: UpdateTicketUseCase,
        private readonly getUC: GetTicketsUseCase,
        private readonly respondUC: ResponderTicketUseCase
    ) { }

    create(dto: CreateTicketDto) { return this.createUC.execute(dto); }

    

    reasignar(id: number, dto: ReasignarTicketDto) { return this.updateUC.reasignar(id, dto); }

    getByUsuario(id: number) { return this.getUC.getByUsuario(id); }

    getActivos() { return this.getUC.getActivos(); }
    getFinalizados() { return this.getUC.getFinalizados(); }
    getTicket(id: number) { return this.getUC.getTicket(id); }


    addRespuesta(ticketId: number, dto: reponderTicketDto) { return this.respondUC.execute(ticketId, dto); }
    getRespuestas(ticketId: number) { return this.respondUC.getRespuestas(ticketId); }
}
