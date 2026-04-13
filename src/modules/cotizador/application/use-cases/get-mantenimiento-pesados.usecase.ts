import { Injectable } from '@nestjs/common';
import {
  ICotizadorPesadosRepository,
  MantenimientoPesadosResponse,
} from '../../domain/cotizador-pesados.repository';

export interface GetMantenimientoPesadosParams {
  clase: string;
  revision: number;
  bodega: number;
  yearModel: number;
}

@Injectable()
export class GetMantenimientoPesadosUseCase {
  constructor(private readonly repo: ICotizadorPesadosRepository) {}

  async execute(
    params: GetMantenimientoPesadosParams,
  ): Promise<MantenimientoPesadosResponse> {
    const { clase, revision, bodega, yearModel } = params;
    if (!clase.trim() || !revision || !bodega || !yearModel) {
      return { grupos: [] };
    }
    return this.repo.getMantenimientoPesados({
      clase: clase.trim(),
      revision,
      bodega,
      yearModel,
    });
  }
}
