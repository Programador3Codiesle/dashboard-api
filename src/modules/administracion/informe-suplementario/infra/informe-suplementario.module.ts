import { Module } from '@nestjs/common';
import { InformeSuplementarioController } from './informe-suplementario.controller';
import { InformeSuplementarioFacade } from '../application/informe-suplementario.facade';
import { ListarTiempoSuplementarioUseCase } from '../application/use-cases/listar-tiempo-suplementario.usecase';
import { ExportarTiempoSuplementarioExcelUseCase } from '../application/use-cases/exportar-tiempo-suplementario-excel.usecase';
import { IInformeTiempoSuplementarioRepository } from '../domain/informe-tiempo-suplementario.repository';
import { InformeTiempoSuplementarioPrismaRepository } from './repositories/informe-tiempo-suplementario.prisma.repository';

@Module({
  controllers: [InformeSuplementarioController],
  providers: [
    InformeSuplementarioFacade,
    ListarTiempoSuplementarioUseCase,
    ExportarTiempoSuplementarioExcelUseCase,
    {
      provide: IInformeTiempoSuplementarioRepository,
      useClass: InformeTiempoSuplementarioPrismaRepository,
    },
  ],
  exports: [InformeSuplementarioFacade],
})
export class InformeTiempoSuplementarioModule {}
