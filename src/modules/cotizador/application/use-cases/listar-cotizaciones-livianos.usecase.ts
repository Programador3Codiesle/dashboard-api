import { Injectable } from '@nestjs/common';
import {
  CotizacionResumen,
  ICotizadorInformesRepository,
} from '../../domain/cotizador-informes.repository';

export interface ListarCotizacionesParams {
  dateStart: string;
  dateEnd: string;
  empresaId?: number;
}

@Injectable()
export class ListarCotizacionesLivianosUseCase {
  constructor(private readonly repo: ICotizadorInformesRepository) {}

  async execute(
    params: ListarCotizacionesParams,
  ): Promise<CotizacionResumen[]> {
    const { dateStart, dateEnd, empresaId } = params;
    return this.repo.listarCotizacionesLivianos(dateStart, dateEnd, empresaId);
  }
}
