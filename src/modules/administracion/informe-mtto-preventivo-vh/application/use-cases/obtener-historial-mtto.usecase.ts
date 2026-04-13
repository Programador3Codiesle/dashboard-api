import { Injectable } from '@nestjs/common';
import { IInformeMttoPreventivoRepository } from '../../domain/informe-mtto-preventivo.repository';

@Injectable()
export class ObtenerHistorialMttoUseCase {
  constructor(private readonly repo: IInformeMttoPreventivoRepository) {}

  async execute(placa: string) {
    return this.repo.obtenerHistorial(placa);
  }
}
