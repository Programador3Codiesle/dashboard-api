import { Module } from '@nestjs/common';
import { OrdenSalidaController } from './orden-salida.controller';
import { OrdenSalidaFacade } from '../application/orden-salida.facade';
import { BuscarOrdenSalidaUseCase } from '../application/use-cases/buscar-orden-salida.usecase';
import { IOrdenSalidaRepository } from '../domain/orden-salida.repository';
import { OrdenSalidaPrismaRepository } from './repositories/orden-salida.prisma.repository';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';

@Module({
    controllers: [OrdenSalidaController],
    providers: [
        OrdenSalidaFacade,
        BuscarOrdenSalidaUseCase,
        { provide: IOrdenSalidaRepository, useClass: OrdenSalidaPrismaRepository },
        PrismaService
    ],
    exports: [OrdenSalidaFacade]
})
export class FormatoOrdenSalidaModule { }
