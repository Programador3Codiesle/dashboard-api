import { Injectable } from '@nestjs/common';
import { ObtenerProductividadTecnicosUseCase } from './use-cases/obtener-productividad-tecnicos.usecase';
import { ProductividadTecnicosResponseEntity } from '../domain/productividad-tecnicos.entity';
import { FiltrosProductividadTecnicos } from '../domain/productividad-tecnicos.repository';

@Injectable()
export class ProductividadTecnicosFacade {
  constructor(
    private readonly obtenerProductividadUseCase: ObtenerProductividadTecnicosUseCase,
  ) {}

  obtenerProductividad(
    filtros: FiltrosProductividadTecnicos,
  ): Promise<ProductividadTecnicosResponseEntity> {
    return this.obtenerProductividadUseCase.execute(filtros);
  }
}
