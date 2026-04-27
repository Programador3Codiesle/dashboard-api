import { Injectable } from '@nestjs/common';
import {
  FiltroNominaDirectorFlotas,
  INominaDirectorFlotasRepository,
} from '../../domain/nomina-director-flotas.repository';
import { NominaDirectorFlotasDetalleEntity } from '../../domain/nomina-director-flotas.entity';

@Injectable()
export class ListarNominaDirectorFlotasDetalleUseCase {
  constructor(private readonly repository: INominaDirectorFlotasRepository) {}

  execute(
    filtro: FiltroNominaDirectorFlotas,
  ): Promise<NominaDirectorFlotasDetalleEntity[]> {
    return this.repository.listarDetalle(filtro);
  }
}

