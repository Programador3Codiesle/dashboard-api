import { Module } from '@nestjs/common';
import { NuevoAusentismoController } from './nuevo-ausentismo.controller';
import { NuevoAusentismoFacade } from '../application/nuevo-ausentismo.facade';
import { CrearAusentismoUseCase } from '../application/use-cases/crear-ausentismo.usecase';
import { ObtenerAusentismosCalendarioUseCase } from '../application/use-cases/obtener-ausentismos-calendario.usecase';
import { CalcularTiempoRestanteAusentismoUseCase } from '../application/use-cases/calcular-tiempo-restante-ausentismo.usecase';
import { ValidarDiaHabilAusentismoUseCase } from '../application/use-cases/validar-dia-habil-ausentismo.usecase';
import { INuevoAusentismoRepository } from '../domain/nuevo-ausentismo.repository';
import { NuevoAusentismoPrismaRepository } from './repositories/nuevo-ausentismo.prisma.repository';
import { EmailModule } from '../../../../core/infra/email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [NuevoAusentismoController],
  providers: [
    NuevoAusentismoFacade,
    CrearAusentismoUseCase,
    ObtenerAusentismosCalendarioUseCase,
    CalcularTiempoRestanteAusentismoUseCase,
    ValidarDiaHabilAusentismoUseCase,
    {
      provide: INuevoAusentismoRepository,
      useClass: NuevoAusentismoPrismaRepository,
    },
  ],
  exports: [NuevoAusentismoFacade, INuevoAusentismoRepository],
})
export class NuevoAusentismoModule {}
