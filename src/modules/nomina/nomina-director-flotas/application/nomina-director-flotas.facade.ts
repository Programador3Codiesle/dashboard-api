import { Injectable } from '@nestjs/common';
import { FiltroNominaDirectorFlotas } from '../domain/nomina-director-flotas.repository';
import { ListarNominaDirectorFlotasPrincipalUseCase } from './use-cases/listar-nomina-director-flotas-principal.usecase';
import { ListarNominaDirectorFlotasDetalleUseCase } from './use-cases/listar-nomina-director-flotas-detalle.usecase';

@Injectable()
export class NominaDirectorFlotasFacade {
  constructor(
    private readonly listarPrincipalUseCase: ListarNominaDirectorFlotasPrincipalUseCase,
    private readonly listarDetalleUseCase: ListarNominaDirectorFlotasDetalleUseCase,
  ) {}

  listarPrincipal(filtro: FiltroNominaDirectorFlotas) {
    return this.listarPrincipalUseCase.execute(filtro);
  }

  listarDetalle(filtro: FiltroNominaDirectorFlotas) {
    return this.listarDetalleUseCase.execute(filtro);
  }
}

