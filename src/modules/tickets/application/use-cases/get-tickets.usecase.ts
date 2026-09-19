import { ForbiddenException, Injectable } from '@nestjs/common';
import { ITicketRepository } from '../../domain/ticket.repository';
import { esPerfilStaffTickets } from '../perfiles-tickets';
import { areaTicketsPorNit } from '../area-tickets-por-nit';

@Injectable()
export class GetTicketsUseCase {
  constructor(private readonly repo: ITicketRepository) {}

  async getByUsuario(userId: number) {
    return this.repo.findByUsuario(userId);
  }

  async getTicket(id: number) {
    return this.repo.findById(id);
  }

  async getActivos(
    page?: number,
    limit?: number,
    perfil?: number,
    nit?: number,
  ) {
    this.assertStaff(perfil);
    return this.repo.findActivos(page, limit, areaTicketsPorNit(nit));
  }

  async getFinalizados(
    page?: number,
    limit?: number,
    perfil?: number,
    nit?: number,
  ) {
    this.assertStaff(perfil);
    return this.repo.findFinalizados(page, limit, areaTicketsPorNit(nit));
  }

  private assertStaff(perfil?: number) {
    if (!esPerfilStaffTickets(perfil)) {
      throw new ForbiddenException('No autorizado para ver todos los tickets');
    }
  }
}
