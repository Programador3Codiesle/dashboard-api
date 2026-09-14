import { BadRequestException, Injectable } from '@nestjs/common';
import {
  FiltrosComisionesLaminaPintura,
  IComisionesLaminaPinturaRepository,
} from '../../domain/comisiones-lamina-pintura.repository';
import { ComisionLaminaPinturaEntity } from '../../domain/comisiones-lamina-pintura.entity';

@Injectable()
export class ListarComisionesLaminaPinturaUseCase {
  constructor(
    private readonly repository: IComisionesLaminaPinturaRepository,
  ) {}

  execute(
    filtros: FiltrosComisionesLaminaPintura,
  ): Promise<ComisionLaminaPinturaEntity[]> {
    if (filtros.soloNitSesion) {
      if (
        !Number.isFinite(filtros.nitUsuarioSesion) ||
        !filtros.nitUsuarioSesion ||
        filtros.nitUsuarioSesion <= 0
      ) {
        throw new BadRequestException(
          'No se pudo determinar el usuario de sesión.',
        );
      }
    }
    return this.repository.listar(filtros);
  }
}
