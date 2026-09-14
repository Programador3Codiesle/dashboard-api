import { Injectable } from '@nestjs/common';
import { CreateTicketUseCase } from './use-cases/create-ticket.usecase';
import { UpdateTicketUseCase } from './use-cases/update-ticket.usecase';
import { GetTicketsUseCase } from './use-cases/get-tickets.usecase';
import { ResponderTicketUseCase } from './use-cases/responder-ticket.usecase';
import { ResolverAdjuntoTicketUseCase } from './use-cases/resolver-adjunto-ticket.usecase';
import { CreateTicketDto, ReasignarTicketDto } from './dto/create-ticket.dto';
import { reponderTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketFacade {
  constructor(
    private readonly createUC: CreateTicketUseCase,
    private readonly updateUC: UpdateTicketUseCase,
    private readonly getUC: GetTicketsUseCase,
    private readonly respondUC: ResponderTicketUseCase,
    private readonly adjuntoUC: ResolverAdjuntoTicketUseCase,
  ) {}

  create(dto: CreateTicketDto) {
    return this.createUC.execute(dto);
  }
  reasignar(id: number, dto: ReasignarTicketDto) {
    return this.updateUC.reasignar(id, dto);
  }
  getByUsuario(id: number) {
    return this.getUC.getByUsuario(id);
  }
  getActivos(page?: number, limit?: number, perfil?: number) {
    return this.getUC.getActivos(page, limit, perfil);
  }
  getFinalizados(page?: number, limit?: number, perfil?: number, nit?: number) {
    return this.getUC.getFinalizados(page, limit, perfil, nit);
  }
  getTicket(id: number) {
    return this.getUC.getTicket(id);
  }
  addRespuesta(
    ticketId: number,
    dto: reponderTicketDto,
    responderNit?: number,
    empresaId?: number,
  ) {
    return this.respondUC.execute(ticketId, dto, responderNit, empresaId);
  }
  getRespuestas(ticketId: number) {
    return this.respondUC.getRespuestas(ticketId);
  }
  resolverAdjunto(file?: string) {
    return this.adjuntoUC.execute(file);
  }
}
