import { Module } from '@nestjs/common';
import { GestionComprasController } from './gestion-compras.controller';
import { GestionCompraFacade } from '../application/gestion-compra.facade';
import { CrearSolicitudCompraUseCase } from '../application/use-cases/crear-solicitud-compra.usecase';
import { ListarComprasUseCase } from '../application/use-cases/listar-compras.usecase';
import { CambiarEstadoCompraUseCase } from '../application/use-cases/cambiar-estado-compra.usecase';
import { MarcarConFacturaCompraUseCase } from '../application/use-cases/marcar-con-factura-compra.usecase';
import { GestionMensajesCompraUseCase } from '../application/use-cases/gestion-mensajes-compra.usecase';
import { EnviarAutorizacionCompraUseCase } from '../application/use-cases/enviar-autorizacion-compra.usecase';
import { ExportarComprasExcelUseCase } from '../application/use-cases/exportar-compras-excel.usecase';
import { IGestionCompraRepository } from '../domain/gestion-compra.repository';
import { GestionCompraPrismaRepository } from './repositories/gestion-compra.prisma.repository';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import { EmailModule } from '../../../../core/infra/email/email.module';

@Module({
    imports: [EmailModule],
    controllers: [GestionComprasController],
    providers: [
        GestionCompraFacade,
        CrearSolicitudCompraUseCase,
        ListarComprasUseCase,
        CambiarEstadoCompraUseCase,
        MarcarConFacturaCompraUseCase,
        GestionMensajesCompraUseCase,
        EnviarAutorizacionCompraUseCase,
        ExportarComprasExcelUseCase,
        { provide: IGestionCompraRepository, useClass: GestionCompraPrismaRepository },
        PrismaService
    ],
    exports: [GestionCompraFacade, IGestionCompraRepository]
})
export class GestionComprasModule { }
