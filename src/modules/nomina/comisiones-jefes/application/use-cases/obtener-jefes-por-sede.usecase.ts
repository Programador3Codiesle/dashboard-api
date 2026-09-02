import { Injectable } from '@nestjs/common';
import { IComisionesJefesRepository } from '../../domain/comisiones-jefes.repository';
import { JefePorSedeEntity } from '../../domain/comisiones-jefes.entity';

@Injectable()
export class ObtenerJefesPorSedeUseCase {
  constructor(private readonly repository: IComisionesJefesRepository) {}

  execute(sede: string): Promise<JefePorSedeEntity[]> {
    return this.repository.obtenerJefesPorSede(sede);
  }
}
