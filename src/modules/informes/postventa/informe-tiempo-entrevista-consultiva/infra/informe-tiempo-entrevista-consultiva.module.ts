import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../../core/infra/prisma/prisma.module';
import { InformeTiempoEntrevistaConsultivaController } from './informe-tiempo-entrevista-consultiva.controller';
import { TiempoEntrevistaConsultivaPrismaRepository } from './repositories/tiempo-entrevista-consultiva.prisma.repository';
import { ITiempoEntrevistaConsultivaRepository } from '../domain/tiempo-entrevista-consultiva.repository';
import { ObtenerResumenTiempoEntrevistaUseCase } from '../application/use-cases/obtener-resumen-tiempo-entrevista.usecase';
import { ObtenerDetalleTiempoEntrevistaUseCase } from '../application/use-cases/obtener-detalle-tiempo-entrevista.usecase';
import { TiempoEntrevistaConsultivaFacade } from '../application/tiempo-entrevista-consultiva.facade';

@Module({
  imports: [PrismaModule],
  controllers: [InformeTiempoEntrevistaConsultivaController],
  providers: [
    {
      provide: ITiempoEntrevistaConsultivaRepository,
      useClass: TiempoEntrevistaConsultivaPrismaRepository,
    },
    ObtenerResumenTiempoEntrevistaUseCase,
    ObtenerDetalleTiempoEntrevistaUseCase,
    TiempoEntrevistaConsultivaFacade,
  ],
})
export class InformeTiempoEntrevistaConsultivaModule {}
