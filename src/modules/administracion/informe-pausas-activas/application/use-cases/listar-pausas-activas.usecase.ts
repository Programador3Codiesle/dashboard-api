import { Injectable } from '@nestjs/common';
import { IInformePausasActivasRepository } from '../../domain/informe-pausas-activas.repository';

export interface FiltrosPausasActivas {
  empleado?: string;
  sede?: string;
  fechaDia?: string;
  fechaMes?: string;
}

@Injectable()
export class ListarPausasActivasUseCase {
  constructor(private readonly repo: IInformePausasActivasRepository) {}

  async execute(filtros: FiltrosPausasActivas) {
    return this.repo.listar({
      empleado: filtros.empleado ?? null,
      sede: filtros.sede ?? null,
      fechaDia: filtros.fechaDia ?? null,
      fechaMes: filtros.fechaMes ?? null,
    });
  }
}

