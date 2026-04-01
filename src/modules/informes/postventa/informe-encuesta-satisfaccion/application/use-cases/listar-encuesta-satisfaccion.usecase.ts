import { Injectable, BadRequestException } from '@nestjs/common';
import {
  FiltrosEncuestaSatisfaccion,
  IEncuestaSatisfaccionRepository,
} from '../../domain/encuesta-satisfaccion.repository';
import { EncuestaSatisfaccionResumenEntity } from '../../domain/encuesta-satisfaccion.entity';

@Injectable()
export class ListarEncuestaSatisfaccionUseCase {
  constructor(
    private readonly encuestaRepo: IEncuestaSatisfaccionRepository,
  ) {}

  async execute(
    filtros: FiltrosEncuestaSatisfaccion,
  ): Promise<EncuestaSatisfaccionResumenEntity[]> {
    if (!filtros.fi || !filtros.ff) {
      throw new BadRequestException(
        'Debe seleccionar un rango de fechas (fi y ff).',
      );
    }

    return this.encuestaRepo.listarResumen(filtros);
  }
}

