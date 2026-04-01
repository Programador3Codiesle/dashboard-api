import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../../core/infra/prisma/prisma.module';
import { InformePacNpsInternoDetalladoController } from './informe-pac-nps-interno-detallado.controller';
import { IPacNpsInternoDetalladoRepository } from '../domain/pac-nps-interno-detallado.repository';
import { PacNpsInternoDetalladoPrismaRepository } from './repositories/pac-nps-interno-detallado.prisma.repository';
import { ListarPacNpsInternoDetalladoUseCase } from '../application/use-cases/listar-pac-nps-interno-detallado.usecase';
import { PacNpsInternoDetalladoFacade } from '../application/pac-nps-interno-detallado.facade';

@Module({
  imports: [PrismaModule],
  controllers: [InformePacNpsInternoDetalladoController],
  providers: [
    {
      provide: IPacNpsInternoDetalladoRepository,
      useClass: PacNpsInternoDetalladoPrismaRepository,
    },
    ListarPacNpsInternoDetalladoUseCase,
    PacNpsInternoDetalladoFacade,
  ],
})
export class InformePacNpsInternoDetalladoModule {}

