import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../../core/infra/prisma/prisma.module';
import { InformePacController } from './informe-pac.controller';
import { IPacRepository } from '../domain/pac.repository';
import { PacPrismaRepository } from './repositories/pac.prisma.repository';
import { ObtenerPacUseCase } from '../application/use-cases/obtener-pac.usecase';
import { PacFacade } from '../application/pac.facade';

@Module({
  imports: [PrismaModule],
  controllers: [InformePacController],
  providers: [
    {
      provide: IPacRepository,
      useClass: PacPrismaRepository,
    },
    ObtenerPacUseCase,
    PacFacade,
  ],
})
export class InformePacModule {}
