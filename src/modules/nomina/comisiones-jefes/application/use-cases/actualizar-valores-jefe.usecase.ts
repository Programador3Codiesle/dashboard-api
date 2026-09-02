import { Injectable } from '@nestjs/common';
import {
  IComisionesJefesRepository,
  UpdateValoresJefeInput,
} from '../../domain/comisiones-jefes.repository';

@Injectable()
export class ActualizarValoresJefeUseCase {
  constructor(private readonly repository: IComisionesJefesRepository) {}

  execute(input: UpdateValoresJefeInput) {
    return this.repository.actualizarValores(input);
  }
}
