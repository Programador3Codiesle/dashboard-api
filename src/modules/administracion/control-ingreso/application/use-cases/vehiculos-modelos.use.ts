import { Injectable } from '@nestjs/common';
import { IControlVehiculoRepository } from '../../domain/control-vehiculo.repository';

@Injectable()
export class VehiculosModelosUseCase {
    constructor(private readonly repo: IControlVehiculoRepository) {}

    async execute() {
        return this.repo.listarVehiculosModelos();
    }
}

