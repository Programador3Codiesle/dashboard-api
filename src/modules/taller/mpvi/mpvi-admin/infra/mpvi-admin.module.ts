import { Module } from '@nestjs/common';
import { MpviAdminController } from './mpvi-admin.controller';
import { MpviAdminFacade } from '../application/mpvi-admin.facade';
import { SubirPlantillaMpviUseCase } from '../application/use-cases/subir-plantilla-mpvi.usecase';
import { SubirTablasAuxiliaresUseCase } from '../application/use-cases/subir-tablas-auxiliares.usecase';
import { ListarCatalogoMpviUseCase } from '../application/use-cases/listar-catalogo-mpvi.usecase';
import { GuardarElementoCatalogoUseCase } from '../application/use-cases/guardar-elemento-catalogo.usecase';
import { IMpviCatalogoRepository } from '../domain/mpvi-catalogo.repository';
import { MpviCatalogoPrismaRepository } from './repositories/mpvi-catalogo.prisma.repository';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';

@Module({
  controllers: [MpviAdminController],
  providers: [
    MpviAdminFacade,
    SubirPlantillaMpviUseCase,
    SubirTablasAuxiliaresUseCase,
    ListarCatalogoMpviUseCase,
    GuardarElementoCatalogoUseCase,
    {
      provide: IMpviCatalogoRepository,
      useClass: MpviCatalogoPrismaRepository,
    },
    PrismaService,
  ],
  exports: [IMpviCatalogoRepository, MpviAdminFacade],
})
export class MpviAdminModule {}
