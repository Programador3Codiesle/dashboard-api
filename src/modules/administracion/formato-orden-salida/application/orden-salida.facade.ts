import { Injectable } from '@nestjs/common';
import { BuscarOrdenSalidaUseCase } from './use-cases/buscar-orden-salida.usecase';

@Injectable()
export class OrdenSalidaFacade {
    constructor(private readonly buscarOrdenUC: BuscarOrdenSalidaUseCase) {}

    buscarPorPlaca(placa: string) {
        return this.buscarOrdenUC.execute(placa);
    }
}
