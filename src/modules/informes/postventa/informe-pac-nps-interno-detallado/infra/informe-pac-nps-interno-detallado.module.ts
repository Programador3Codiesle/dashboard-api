import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../../core/infra/prisma/prisma.module';
import { InformePacNpsInternoDetalladoController } from './informe-pac-nps-interno-detallado.controller';
import { IPacNpsInternoDetalladoRepository } from '../domain/pac-nps-interno-detallado.repository';
import { PacNpsInternoDetalladoPrismaRepository } from './repositories/pac-nps-interno-detallado.prisma.repository';
import { ListarPacNpsInternoDetalladoUseCase } from '../application/use-cases/listar-pac-nps-interno-detallado.usecase';
import { ListarTecnicosPacNpsBodegaUseCase } from '../application/use-cases/listar-tecnicos-pac-nps-bodega.usecase';
import { ListarEncuestasPacNpsTecnicoUseCase } from '../application/use-cases/listar-encuestas-pac-nps-tecnico.usecase';
import { ExportarPacNpsDetalleTecnicoExcelUseCase } from '../application/use-cases/exportar-pac-nps-detalle-tecnico-excel.usecase';
import { ExportarPacNpsTodosTecnicosExcelUseCase } from '../application/use-cases/exportar-pac-nps-todos-tecnicos-excel.usecase';
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
    ListarTecnicosPacNpsBodegaUseCase,
    ListarEncuestasPacNpsTecnicoUseCase,
    ExportarPacNpsDetalleTecnicoExcelUseCase,
    ExportarPacNpsTodosTecnicosExcelUseCase,
    PacNpsInternoDetalladoFacade,
  ],
})
export class InformePacNpsInternoDetalladoModule {}
