import { Module } from '@nestjs/common';
import { GestionComprasController } from './gestion-compras.controller';
import { GestionCompraFacade } from '../application/gestion-compra.facade';
import { CrearSolicitudCompraUseCase } from '../application/use-cases/crear-solicitud-compra.usecase';
import { ListarComprasUseCase } from '../application/use-cases/listar-compras.usecase';
import { IGestionCompraRepository } from '../domain/gestion-compra.repository';
import { GestionCompraPrismaRepository } from './repositories/gestion-compra.prisma.repository';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';

@Module({
    controllers: [GestionComprasController],
    providers: [
        GestionCompraFacade,
        CrearSolicitudCompraUseCase,
        ListarComprasUseCase,
        { provide: IGestionCompraRepository, useClass: GestionCompraPrismaRepository },
        PrismaService
    ],
    exports: [GestionCompraFacade]
})
export class GestionComprasModule { }
