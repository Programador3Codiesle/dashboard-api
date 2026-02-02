import { Module } from '@nestjs/common';
import { NuevoAusentismoController } from './nuevo-ausentismo.controller';
import { NuevoAusentismoFacade } from '../application/nuevo-ausentismo.facade';
import { CrearAusentismoUseCase } from '../application/use-cases/crear-ausentismo.usecase';
import { ObtenerAusentismosCalendarioUseCase } from '../application/use-cases/obtener-ausentismos-calendario.usecase';
import { INuevoAusentismoRepository } from '../domain/nuevo-ausentismo.repository';
import { NuevoAusentismoPrismaRepository } from './repositories/nuevo-ausentismo.prisma.repository';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import { EmailModule } from '../../../../core/infra/email/email.module';

@Module({
    imports: [EmailModule],
    controllers: [NuevoAusentismoController],
    providers: [
        NuevoAusentismoFacade,
        CrearAusentismoUseCase,
        ObtenerAusentismosCalendarioUseCase,
        { provide: INuevoAusentismoRepository, useClass: NuevoAusentismoPrismaRepository },
        PrismaService
    ],
    exports: [NuevoAusentismoFacade, INuevoAusentismoRepository]
})
export class NuevoAusentismoModule { }
