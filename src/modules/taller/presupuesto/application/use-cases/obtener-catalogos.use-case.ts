import { Injectable } from '@nestjs/common';
import { IPresupuestoRepository } from '../../domain/repositories/presupuesto.repository.interface';

@Injectable()
export class ObtenerCatalogosPresupuestoUseCase {
  constructor(private readonly repository: IPresupuestoRepository) {}

  execute() {
    return this.repository.obtenerCatalogos();
  }
}
