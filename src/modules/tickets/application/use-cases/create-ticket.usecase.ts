
import { Injectable } from '@nestjs/common';
import { ITicketRepository } from '../../domain/ticket.repository';
import { CreateTicketDto } from '../dto/create-ticket.dto';

@Injectable()
export class CreateTicketUseCase {
    constructor(private readonly repo: ITicketRepository) { }

    async execute(dto: CreateTicketDto) {
        return this.repo.create(dto);
    }
}
