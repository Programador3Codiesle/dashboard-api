import { Injectable } from '@nestjs/common';
import { IListaAusentismoRepository } from '../../domain/lista-ausentismo.repository';

@Injectable()
export class ObtenerAusentismosDiaActualUseCase {
  constructor(private readonly repo: IListaAusentismoRepository) {}

  async execute(sede: string) {
    return this.repo.obtenerDiaActual(sede);
  }
}
