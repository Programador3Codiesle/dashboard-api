import { Injectable } from '@nestjs/common';
import { IPosiblesRetornosRepository } from '../../domain/repositories/posibles-retornos.repository.interface';

@Injectable()
export class ObtenerCatalogosUseCase {
  constructor(private readonly repository: IPosiblesRetornosRepository) {}

  execute() {
    return this.repository.obtenerCatalogos();
  }
}
