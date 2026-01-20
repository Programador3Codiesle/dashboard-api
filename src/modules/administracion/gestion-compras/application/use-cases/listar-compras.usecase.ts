import { Injectable } from '@nestjs/common';
import { IGestionCompraRepository } from '../../domain/gestion-compra.repository';
import { FiltrosComprasDto } from '../dto/filtros-compras.dto';

@Injectable()
export class ListarComprasUseCase {
    constructor(private readonly repo: IGestionCompraRepository) {}

    async execute(filtros?: FiltrosComprasDto) {
        return this.repo.listar(filtros);
    }
}
