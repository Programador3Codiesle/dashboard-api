import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { IInformeOtAbiertasRepository } from '../domain/informe-ot-abiertas.repository';
import { InformeOtAbiertasFacade } from '../application/informe-ot-abiertas.facade';
import {
  ObtenerInformeGeneralUseCase,
  ObtenerInformePorSedeUseCase,
  ObtenerInformePorTallerUseCase,
} from '../application/use-cases/obtener-informe-ot-abiertas.usecase';
import { InformeOtAbiertasController } from './informe-ot-abiertas.controller';
import { InformeOtAbiertasPrismaRepository } from './repositories/informe-ot-abiertas.prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [InformeOtAbiertasController],
  providers: [
    {
      provide: IInformeOtAbiertasRepository,
      useClass: InformeOtAbiertasPrismaRepository,
    },
    ObtenerInformeGeneralUseCase,
    ObtenerInformePorSedeUseCase,
    ObtenerInformePorTallerUseCase,
    InformeOtAbiertasFacade,
  ],
})
export class InformeOtAbiertasModule {}
