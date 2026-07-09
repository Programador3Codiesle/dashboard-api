import {
  NominaDirectorFlotasDetalleEntity,
  NominaDirectorFlotasPrincipalEntity,
} from './nomina-director-flotas.entity';

export interface FiltroNominaDirectorFlotas {
  ano: number;
  mes: number;
}

export abstract class INominaDirectorFlotasRepository {
  abstract listarPrincipal(
    filtro: FiltroNominaDirectorFlotas,
  ): Promise<NominaDirectorFlotasPrincipalEntity[]>;

  abstract listarDetalle(
    filtro: FiltroNominaDirectorFlotas,
  ): Promise<NominaDirectorFlotasDetalleEntity[]>;
}
