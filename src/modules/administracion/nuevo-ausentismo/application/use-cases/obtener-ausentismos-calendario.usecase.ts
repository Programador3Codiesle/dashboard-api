import { Injectable } from '@nestjs/common';
import { INuevoAusentismoRepository } from '../../domain/nuevo-ausentismo.repository';

@Injectable()
export class ObtenerAusentismosCalendarioUseCase {
    constructor(private readonly repo: INuevoAusentismoRepository) {}

    async execute(mes: number, anio: number, userId: number) {
        return this.repo.obtenerPorMes(mes, anio, userId);
    }
}
