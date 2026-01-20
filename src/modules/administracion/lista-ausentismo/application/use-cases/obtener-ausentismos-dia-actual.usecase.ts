import { Injectable } from '@nestjs/common';
import { IListaAusentismoRepository } from '../../domain/lista-ausentismo.repository';

@Injectable()
export class ObtenerAusentismosDiaActualUseCase {
    constructor(private readonly repo: IListaAusentismoRepository) {}

    async execute() {
        return this.repo.obtenerDiaActual();
    }
}
