import { Injectable } from '@nestjs/common';
import {
  FiltroNominaDirectorFlotas,
  INominaDirectorFlotasRepository,
} from '../../domain/nomina-director-flotas.repository';
import { NominaDirectorFlotasPrincipalEntity } from '../../domain/nomina-director-flotas.entity';

@Injectable()
export class ListarNominaDirectorFlotasPrincipalUseCase {
  constructor(private readonly repository: INominaDirectorFlotasRepository) {}

  execute(
    filtro: FiltroNominaDirectorFlotas,
  ): Promise<NominaDirectorFlotasPrincipalEntity[]> {
    return this.repository.listarPrincipal(filtro);
  }
}
