import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../../core/infra/prisma/prisma.module';
import { InformeSegundaEntregaController } from './informe-segunda-entrega.controller';
import { ISegundaEntregaRepository } from '../domain/segunda-entrega.repository';
import { SegundaEntregaPrismaRepository } from './repositories/segunda-entrega.prisma.repository';
import { ListarSegundaEntregaUseCase } from '../application/use-cases/listar-segunda-entrega.usecase';
import { SegundaEntregaFacade } from '../application/segunda-entrega.facade';

@Module({
  imports: [PrismaModule],
  controllers: [InformeSegundaEntregaController],
  providers: [
    {
      provide: ISegundaEntregaRepository,
      useClass: SegundaEntregaPrismaRepository,
    },
    ListarSegundaEntregaUseCase,
    SegundaEntregaFacade,
  ],
})
export class InformeSegundaEntregaModule {}

