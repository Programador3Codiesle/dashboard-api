import { Injectable } from '@nestjs/common';
import { ObtenerRetencion720UseCase } from './use-cases/obtener-retencion-72-0.usecase';
import { Retencion720RowEntity } from '../domain/retencion-72-0.entity';

@Injectable()
export class Retencion720Facade {
  constructor(
    private readonly obtenerRetencionUseCase: ObtenerRetencion720UseCase,
  ) {}

  obtenerResumen(): Promise<Retencion720RowEntity[]> {
    return this.obtenerRetencionUseCase.execute();
  }
}

