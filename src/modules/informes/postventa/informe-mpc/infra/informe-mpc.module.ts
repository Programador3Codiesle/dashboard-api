import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../../core/infra/prisma/prisma.module';
import { InformeMpcController } from './informe-mpc.controller';
import { IMpcRepository } from '../domain/mpc.repository';
import { MpcPrismaRepository } from './repositories/mpc.prisma.repository';
import { ListarMpcUseCase } from '../application/use-cases/listar-mpc.usecase';
import { CambiarEstadoCasoEspecialUseCase } from '../application/use-cases/cambiar-estado-caso-especial.usecase';
import { MpcFacade } from '../application/mpc.facade';

@Module({
  imports: [PrismaModule],
  controllers: [InformeMpcController],
  providers: [
    {
      provide: IMpcRepository,
      useClass: MpcPrismaRepository,
    },
    ListarMpcUseCase,
    CambiarEstadoCasoEspecialUseCase,
    MpcFacade,
  ],
})
export class InformeMpcModule {}
