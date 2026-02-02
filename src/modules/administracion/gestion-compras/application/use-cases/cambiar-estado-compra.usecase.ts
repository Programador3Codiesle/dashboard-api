import { Injectable } from '@nestjs/common';
import { IGestionCompraRepository } from '../../domain/gestion-compra.repository';
import { CambiarEstadoCompraDto } from '../dto/cambiar-estado-compra.dto';

@Injectable()
export class CambiarEstadoCompraUseCase {
    constructor(private readonly repo: IGestionCompraRepository) {}

    async execute(id: bigint, dto: CambiarEstadoCompraDto) {
        const success = await this.repo.cambiarEstado(id, dto.estado);
        return {
            status: success,
            message: success 
                ? 'Estado de compra actualizado correctamente'
                : 'No se pudo actualizar el estado de la compra'
        };
    }
}
