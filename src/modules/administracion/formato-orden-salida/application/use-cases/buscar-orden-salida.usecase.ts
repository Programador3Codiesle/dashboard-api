import { Injectable } from '@nestjs/common';
import { IOrdenSalidaRepository } from '../../domain/orden-salida.repository';

@Injectable()
export class BuscarOrdenSalidaUseCase {
  constructor(private readonly repo: IOrdenSalidaRepository) {}

  async execute(placa: string) {
    return this.repo.buscarPorPlaca(placa);
  }
}
