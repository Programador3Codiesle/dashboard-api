import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { InformeMttoPreventivoController } from './informe-mtto-preventivo.controller';
import { InformeMttoPreventivoFacade } from '../application/informe-mtto-preventivo.facade';
import { ListarMttoPreventivoUseCase } from '../application/use-cases/listar-mtto-preventivo.usecase';
import { ObtenerHistorialMttoUseCase } from '../application/use-cases/obtener-historial-mtto.usecase';
import { IInformeMttoPreventivoRepository } from '../domain/informe-mtto-preventivo.repository';
import { InformeMttoPreventivoPrismaRepository } from './repositories/informe-mtto-preventivo.prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [InformeMttoPreventivoController],
  providers: [
    InformeMttoPreventivoFacade,
    ListarMttoPreventivoUseCase,
    ObtenerHistorialMttoUseCase,
    {
      provide: IInformeMttoPreventivoRepository,
      useClass: InformeMttoPreventivoPrismaRepository,
    },
  ],
})
export class InformeMttoPreventivoVhModule {}

