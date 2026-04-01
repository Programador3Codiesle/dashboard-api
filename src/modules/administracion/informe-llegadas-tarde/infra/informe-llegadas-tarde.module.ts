import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { InformeLlegadasTardeController } from './informe-llegadas-tarde.controller';
import { LlegadasTardeFacade } from '../application/llegadas-tarde.facade';
import { ListarLlegadasTardeUseCase } from '../application/use-cases/listar-llegadas-tarde.usecase';
import { ListarResumenLlegadasTardeUseCase } from '../application/use-cases/listar-resumen-llegadas-tarde.usecase';
import { ILlegadasTardeRepository } from '../domain/llegadas-tarde.repository';
import { LlegadasTardePrismaRepository } from './repositories/llegadas-tarde.prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [InformeLlegadasTardeController],
  providers: [
    LlegadasTardeFacade,
    ListarLlegadasTardeUseCase,
    ListarResumenLlegadasTardeUseCase,
    {
      provide: ILlegadasTardeRepository,
      useClass: LlegadasTardePrismaRepository,
    },
  ],
})
export class InformeLlegadasTardeModule {}

