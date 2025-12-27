
import { Injectable } from '@nestjs/common';
import { ITicketRepository } from '../../domain/ticket.repository';

@Injectable()
export class GetTicketsUseCase {
    constructor(private readonly repo: ITicketRepository) { }

    async getByUsuario(userId: number) {
        return this.repo.findByUsuario(userId);
    }

    async getTicket(id: number) {
        return this.repo.findById(id);
    }
    
    async getActivos() {
        return this.repo.findActivos();
    }

    async getFinalizados() {
        return this.repo.findFinalizados();
    }
}
