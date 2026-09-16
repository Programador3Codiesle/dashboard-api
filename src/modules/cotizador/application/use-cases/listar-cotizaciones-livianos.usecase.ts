import { Injectable } from '@nestjs/common';
import {
  CotizacionResumen,
  ICotizadorInformesRepository,
} from '../../domain/cotizador-informes.repository';
import {
  alcanceInformeLivianos,
  visibilidadDesdeAlcance,
} from '../informe-cotizaciones-visibilidad';

export interface ListarCotizacionesParams {
  dateStart: string;
  dateEnd: string;
  empresaId?: number;
  nitUsuario: number;
  perfilId: number;
}

@Injectable()
export class ListarCotizacionesLivianosUseCase {
  constructor(private readonly repo: ICotizadorInformesRepository) {}

  async execute(
    params: ListarCotizacionesParams,
  ): Promise<CotizacionResumen[]> {
    const { dateStart, dateEnd, empresaId, nitUsuario, perfilId } = params;
    const visibilidad = await visibilidadDesdeAlcance(
      alcanceInformeLivianos(perfilId),
      nitUsuario,
      (nit) => this.repo.getSedesUsuarioByNit(nit),
    );
    return this.repo.listarCotizacionesLivianos(
      dateStart,
      dateEnd,
      visibilidad,
      empresaId,
    );
  }
}
