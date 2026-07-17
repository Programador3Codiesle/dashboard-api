import { Module } from '@nestjs/common';
import { EncuestasFacade } from '../application/encuestas.facade';
import { ENCUESTAS_REPOSITORY } from '../domain/encuestas.repository';
import { EncuestasController } from './encuestas.controller';
import { EncuestaQrController } from './encuesta-qr.controller';
import { EncuestasPrismaRepository } from './repositories/encuestas.prisma.repository';

@Module({
  controllers: [EncuestasController, EncuestaQrController],
  providers: [
    EncuestasFacade,
    {
      provide: ENCUESTAS_REPOSITORY,
      useClass: EncuestasPrismaRepository,
    },
  ],
  exports: [EncuestasFacade],
})
export class EncuestasModule {}
