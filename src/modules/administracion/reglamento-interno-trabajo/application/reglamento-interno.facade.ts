import { Injectable } from '@nestjs/common';
import { IReglamentoInternoRepository } from '../domain/reglamento-interno.repository';

@Injectable()
export class ReglamentoInternoFacade {
  constructor(
    private readonly reglamentoInternoRepository: IReglamentoInternoRepository,
  ) {}

  obtenerRutaArchivo(): string {
    return this.reglamentoInternoRepository.obtenerRutaArchivo();
  }
}
