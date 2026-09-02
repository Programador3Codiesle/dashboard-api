import { Injectable } from '@nestjs/common';
import {
  FiltrosComisionesJefes,
  IComisionesJefesRepository,
} from '../../domain/comisiones-jefes.repository';
import { ComisionJefeEntity } from '../../domain/comisiones-jefes.entity';

@Injectable()
export class ListarComisionesJefesUseCase {
  constructor(private readonly repository: IComisionesJefesRepository) {}

  execute(filtros: FiltrosComisionesJefes): Promise<ComisionJefeEntity[]> {
    return this.repository.listarComisiones(filtros);
  }
}
