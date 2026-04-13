import { Injectable } from '@nestjs/common';
import { ITicketRepository } from '../../domain/ticket.repository';

@Injectable()
export class GetTicketsUseCase {
  constructor(private readonly repo: ITicketRepository) {}

  async getByUsuario(userId: number) {
    return this.repo.findByUsuario(userId);
  }

  async getTicket(id: number) {
    return this.repo.findById(id);
  }

  async getActivos(page?: number, limit?: number) {
    return this.repo.findActivos(page, limit);
  }

  async getFinalizados(page?: number, limit?: number) {
    return this.repo.findFinalizados(page, limit);
  }
}
