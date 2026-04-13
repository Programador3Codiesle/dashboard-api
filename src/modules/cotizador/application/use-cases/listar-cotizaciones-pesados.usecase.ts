import { Injectable } from '@nestjs/common';
import {
  CotizacionResumen,
  ICotizadorInformesRepository,
} from '../../domain/cotizador-informes.repository';
import { ListarCotizacionesParams } from './listar-cotizaciones-livianos.usecase';

@Injectable()
export class ListarCotizacionesPesadosUseCase {
  constructor(private readonly repo: ICotizadorInformesRepository) {}

  async execute(
    params: ListarCotizacionesParams,
  ): Promise<CotizacionResumen[]> {
    const { dateStart, dateEnd, empresaId } = params;
    return this.repo.listarCotizacionesPesados(dateStart, dateEnd, empresaId);
  }
}
