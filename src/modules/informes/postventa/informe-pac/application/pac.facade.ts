import { Injectable } from '@nestjs/common';
import { ObtenerPacUseCase } from './use-cases/obtener-pac.usecase';
import { PacResumenEntity } from '../domain/pac.entity';

@Injectable()
export class PacFacade {
  constructor(private readonly obtenerPac: ObtenerPacUseCase) {}

  resumen(): Promise<PacResumenEntity> {
    return this.obtenerPac.execute();
  }
}

