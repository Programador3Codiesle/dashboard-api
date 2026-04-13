import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { InformePausasActivasController } from './informe-pausas-activas.controller';
import { InformePausasActivasFacade } from '../application/informe-pausas-activas.facade';
import { ListarPausasActivasUseCase } from '../application/use-cases/listar-pausas-activas.usecase';
import { IInformePausasActivasRepository } from '../domain/informe-pausas-activas.repository';
import { InformePausasActivasPrismaRepository } from './repositories/informe-pausas-activas.prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [InformePausasActivasController],
  providers: [
    InformePausasActivasFacade,
    ListarPausasActivasUseCase,
    {
      provide: IInformePausasActivasRepository,
      useClass: InformePausasActivasPrismaRepository,
    },
  ],
})
export class InformePausasActivasModule {}
