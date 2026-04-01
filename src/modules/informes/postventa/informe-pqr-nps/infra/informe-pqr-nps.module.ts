import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../../core/infra/prisma/prisma.module';
import { InformePqrNpsController } from './informe-pqr-nps.controller';
import { PqrNpsPrismaRepository } from './repositories/pqr-nps.prisma.repository';
import { IPqrNpsRepository } from '../domain/pqr-nps.repository';
import { ListarPqrNpsUseCase } from '../application/use-cases/listar-pqr-nps.usecase';
import { PqrNpsFacade } from '../application/pqr-nps.facade';

@Module({
  imports: [PrismaModule],
  controllers: [InformePqrNpsController],
  providers: [
    {
      provide: IPqrNpsRepository,
      useClass: PqrNpsPrismaRepository,
    },
    ListarPqrNpsUseCase,
    PqrNpsFacade,
  ],
})
export class InformePqrNpsModule {}

