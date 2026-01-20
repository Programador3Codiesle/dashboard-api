import { Module } from '@nestjs/common';
import { InformeAusentismoController } from './informe-ausentismo.controller';
import { InformeAusentismoFacade } from '../application/informe-ausentismo.facade';
import { ListarAusentismosUseCase } from '../application/use-cases/listar-ausentismos.usecase';
import { ObtenerDetalleAusentismoUseCase } from '../application/use-cases/obtener-detalle-ausentismo.usecase';
import { IAusentismoRepository } from '../domain/ausentismo.repository';
import { InformeAusentismoPrismaRepository } from './repositories/informe-ausentismo.prisma.repository';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';

@Module({
    controllers: [InformeAusentismoController],
    providers: [
        InformeAusentismoFacade,
        ListarAusentismosUseCase,
        ObtenerDetalleAusentismoUseCase,
        { provide: IAusentismoRepository, useClass: InformeAusentismoPrismaRepository },
        PrismaService
    ],
    exports: [InformeAusentismoFacade]
})
export class InformeAusentismoModule { }
