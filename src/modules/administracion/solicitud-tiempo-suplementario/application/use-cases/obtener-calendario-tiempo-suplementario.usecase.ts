import { Injectable } from '@nestjs/common';
import { ITiempoSuplementarioRepository } from '../../domain/tiempo-suplementario.repository';

@Injectable()
export class ObtenerCalendarioTiempoSuplementarioUseCase {
    constructor(private readonly repo: ITiempoSuplementarioRepository) {}

    async execute(mes: number, anio: number, userId: number) {
        return this.repo.obtenerPorMes(mes, anio, userId);
    }
}
