import { Injectable } from '@nestjs/common';
import {
  FiltrosComisionesLaminaPintura,
  IComisionesLaminaPinturaRepository,
} from '../../domain/comisiones-lamina-pintura.repository';
import { ComisionLaminaPinturaEntity } from '../../domain/comisiones-lamina-pintura.entity';

@Injectable()
export class ListarComisionesLaminaPinturaUseCase {
  constructor(private readonly repository: IComisionesLaminaPinturaRepository) {}

  execute(
    filtros: FiltrosComisionesLaminaPintura,
  ): Promise<ComisionLaminaPinturaEntity[]> {
    return this.repository.listar(filtros);
  }
}

