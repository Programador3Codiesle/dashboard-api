import { Module } from '@nestjs/common';
import { SolicitudTiempoSuplementarioController } from './solicitud-tiempo-suplementario.controller';
import { SolicitudTiempoSuplementarioFacade } from '../application/solicitud-tiempo-suplementario.facade';
import { CrearTiempoSuplementarioUseCase } from '../application/use-cases/crear-tiempo-suplementario.usecase';
import { ObtenerCalendarioTiempoSuplementarioUseCase } from '../application/use-cases/obtener-calendario-tiempo-suplementario.usecase';
import { ITiempoSuplementarioRepository } from '../domain/tiempo-suplementario.repository';
import { TiempoSuplementarioPrismaRepository } from './repositories/tiempo-suplementario.prisma.repository';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import { EmailModule } from '../../../../core/infra/email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [SolicitudTiempoSuplementarioController],
  providers: [
    SolicitudTiempoSuplementarioFacade,
    CrearTiempoSuplementarioUseCase,
    ObtenerCalendarioTiempoSuplementarioUseCase,
    {
      provide: ITiempoSuplementarioRepository,
      useClass: TiempoSuplementarioPrismaRepository,
    },
    PrismaService,
  ],
  exports: [SolicitudTiempoSuplementarioFacade, ITiempoSuplementarioRepository],
})
export class SolicitudTiempoSuplementarioModule {}
