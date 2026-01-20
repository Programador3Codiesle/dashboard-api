import { Injectable } from '@nestjs/common';
import { IFormatoNominaRepository } from '../../domain/formato-nomina.repository';

@Injectable()
export class ObtenerFormatosUseCase {
    constructor(private readonly repo: IFormatoNominaRepository) {}

    async execute() {
        return this.repo.obtenerFormatos();
    }
}
