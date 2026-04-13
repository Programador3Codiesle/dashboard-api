import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../../core/infra/prisma/prisma.module';
import { InformeTicketPromedioTecnicoController } from './informe-ticket-promedio-tecnico.controller';
import { TicketPromedioTecnicoPrismaRepository } from './repositories/ticket-promedio-tecnico.prisma.repository';
import { ITicketPromedioTecnicoRepository } from '../domain/ticket-promedio-tecnico.repository';
import { ObtenerTicketPromedioTecnicoUseCase } from '../application/use-cases/obtener-ticket-promedio-tecnico.usecase';
import { TicketPromedioTecnicoFacade } from '../application/ticket-promedio-tecnico.facade';

@Module({
  imports: [PrismaModule],
  controllers: [InformeTicketPromedioTecnicoController],
  providers: [
    {
      provide: ITicketPromedioTecnicoRepository,
      useClass: TicketPromedioTecnicoPrismaRepository,
    },
    ObtenerTicketPromedioTecnicoUseCase,
    TicketPromedioTecnicoFacade,
  ],
})
export class InformeTicketPromedioTecnicoModule {}
