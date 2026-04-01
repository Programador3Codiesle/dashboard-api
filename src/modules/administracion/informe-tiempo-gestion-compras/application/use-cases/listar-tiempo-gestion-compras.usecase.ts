import { Injectable, BadRequestException } from '@nestjs/common';
import {
  FiltrosTiempoGestionCompras,
  ITiempoGestionComprasRepository,
} from '../../domain/tiempo-gestion-compras.repository';

@Injectable()
export class ListarTiempoGestionComprasUseCase {
  constructor(private readonly repo: ITiempoGestionComprasRepository) {}

  async execute(filtros: FiltrosTiempoGestionCompras) {
    if ((filtros.fechaIni && !filtros.fechaFin) || (!filtros.fechaIni && filtros.fechaFin)) {
      throw new BadRequestException('Debe indicar ambas fechas');
    }

    return this.repo.listar(filtros);
  }
}

