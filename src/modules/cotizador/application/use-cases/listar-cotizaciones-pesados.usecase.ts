import { Injectable } from '@nestjs/common';
import {
  CotizacionResumen,
  ICotizadorInformesRepository,
} from '../../domain/cotizador-informes.repository';
import {
  alcanceInformePesados,
  visibilidadDesdeAlcance,
} from '../informe-cotizaciones-visibilidad';
import { ListarCotizacionesParams } from './listar-cotizaciones-livianos.usecase';

@Injectable()
export class ListarCotizacionesPesadosUseCase {
  constructor(private readonly repo: ICotizadorInformesRepository) {}

  async execute(
    params: ListarCotizacionesParams,
  ): Promise<CotizacionResumen[]> {
    const { dateStart, dateEnd, empresaId, nitUsuario, perfilId } = params;
    const visibilidad = await visibilidadDesdeAlcance(
      alcanceInformePesados(perfilId),
      nitUsuario,
      (nit) => this.repo.getSedesUsuarioByNit(nit),
    );
    return this.repo.listarCotizacionesPesados(
      dateStart,
      dateEnd,
      visibilidad,
      empresaId,
    );
  }
}
