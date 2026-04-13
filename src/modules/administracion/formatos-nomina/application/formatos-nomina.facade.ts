import { Injectable } from '@nestjs/common';
import { ObtenerFormatosUseCase } from './use-cases/obtener-formatos.usecase';
import { IFormatoNominaRepository } from '../domain/formato-nomina.repository';

@Injectable()
export class FormatosNominaFacade {
  constructor(
    private readonly obtenerFormatosUC: ObtenerFormatosUseCase,
    private readonly repo: IFormatoNominaRepository,
  ) {}

  obtenerFormatos() {
    return this.obtenerFormatosUC.execute();
  }

  async obtenerRutaArchivo(id: number) {
    return this.repo.obtenerRutaArchivo(id);
  }
}
