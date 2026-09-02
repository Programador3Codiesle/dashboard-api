import { Injectable } from '@nestjs/common';
import {
  CheckValoresJefeInput,
  IComisionesJefesRepository,
} from '../../domain/comisiones-jefes.repository';

@Injectable()
export class CheckValoresJefeUseCase {
  constructor(private readonly repository: IComisionesJefesRepository) {}

  execute(input: CheckValoresJefeInput) {
    return this.repository.checkValoresMesAnterior(input);
  }
}
