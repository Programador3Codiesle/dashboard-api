import { Injectable } from '@nestjs/common';
import { CrearSolicitudCompraUseCase } from './use-cases/crear-solicitud-compra.usecase';
import { ListarComprasUseCase } from './use-cases/listar-compras.usecase';
import { CreateGestionCompraDto } from './dto/create-gestion-compra.dto';
import { FiltrosComprasDto } from './dto/filtros-compras.dto';

@Injectable()
export class GestionCompraFacade {
    constructor(
        private readonly crearSolicitudUC: CrearSolicitudCompraUseCase,
        private readonly listarComprasUC: ListarComprasUseCase
    ) {}

    crearSolicitud(dto: CreateGestionCompraDto, userId: number) {
        return this.crearSolicitudUC.execute(dto, userId);
    }

    listarCompras(filtros?: FiltrosComprasDto) {
        return this.listarComprasUC.execute(filtros);
    }
}
