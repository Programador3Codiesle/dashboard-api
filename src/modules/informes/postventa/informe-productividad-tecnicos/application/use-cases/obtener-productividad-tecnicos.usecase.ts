import { Injectable } from '@nestjs/common';
import {
  FiltrosProductividadTecnicos,
  IProductividadTecnicosRepository,
} from '../../domain/productividad-tecnicos.repository';
import { ProductividadTecnicosResponseEntity } from '../../domain/productividad-tecnicos.entity';

@Injectable()
export class ObtenerProductividadTecnicosUseCase {
  constructor(private readonly repository: IProductividadTecnicosRepository) {}

  execute(
    filtros: FiltrosProductividadTecnicos,
  ): Promise<ProductividadTecnicosResponseEntity> {
    return this.repository.obtenerProductividad(filtros);
  }
}
