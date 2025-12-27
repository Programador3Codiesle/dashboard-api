
import { Module } from '@nestjs/common';
import { TicketController } from './tickets.controller';
import { TicketFacade } from '../application/ticket.facade';
import { CreateTicketUseCase } from '../application/use-cases/create-ticket.usecase';
import { UpdateTicketUseCase } from '../application/use-cases/update-ticket.usecase';
import { GetTicketsUseCase } from '../application/use-cases/get-tickets.usecase';
import { ResponderTicketUseCase } from '../application/use-cases/responder-ticket.usecase';
import { ITicketRepository } from '../domain/ticket.repository';
import { TicketPrismaRepository } from './repositories/ticket.prisma.repository';
import { PrismaService } from '../../../core/infra/prisma/prisma.service';

@Module({
    controllers: [TicketController],
    providers: [
        TicketFacade,
        CreateTicketUseCase,
        UpdateTicketUseCase,
        GetTicketsUseCase,
        ResponderTicketUseCase,
        { provide: ITicketRepository, useClass: TicketPrismaRepository },
        PrismaService
    ],
    exports: [TicketFacade]
})
export class TicketsModule { }
