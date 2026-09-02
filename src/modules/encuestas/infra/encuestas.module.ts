import { Module } from '@nestjs/common';
import { EncuestasFacade } from '../application/encuestas.facade';
import { DetalleSatisfaccionUseCase } from '../application/use-cases/detalle-satisfaccion.usecase';
import { EncuestaQrUseCase } from '../application/use-cases/encuesta-qr.usecase';
import { ListarSatisfaccionUseCase } from '../application/use-cases/listar-satisfaccion.usecase';
import { NpsColmotoresUseCase } from '../application/use-cases/nps-colmotores.usecase';
import { NpsTecnicosExcelUseCase } from '../application/use-cases/nps-tecnicos-excel.usecase';
import { IEncuestasRepository } from '../domain/encuestas.repository';
import { EncuestasController } from './encuestas.controller';
import { EncuestaQrController } from './encuesta-qr.controller';
import { EncuestasPrismaRepository } from './repositories/encuestas.prisma.repository';

@Module({
  controllers: [EncuestasController, EncuestaQrController],
  providers: [
    EncuestasFacade,
    ListarSatisfaccionUseCase,
    DetalleSatisfaccionUseCase,
    NpsColmotoresUseCase,
    NpsTecnicosExcelUseCase,
    EncuestaQrUseCase,
    {
      provide: IEncuestasRepository,
      useClass: EncuestasPrismaRepository,
    },
  ],
  exports: [EncuestasFacade],
})
export class EncuestasModule {}
