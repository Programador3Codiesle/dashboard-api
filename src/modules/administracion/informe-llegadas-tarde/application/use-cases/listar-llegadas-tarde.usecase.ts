import { Injectable, BadRequestException } from '@nestjs/common';
import {
  FiltrosLlegadasTarde,
  ILlegadasTardeRepository,
} from '../../domain/llegadas-tarde.repository';

@Injectable()
export class ListarLlegadasTardeUseCase {
  constructor(private readonly repo: ILlegadasTardeRepository) {}

  async execute(filtros: FiltrosLlegadasTarde) {
    if (!filtros.fechaInicio || !filtros.fechaFin) {
      throw new BadRequestException('Debe seleccionar dos fechas');
    }
    return this.repo.listar(filtros);
  }
}

