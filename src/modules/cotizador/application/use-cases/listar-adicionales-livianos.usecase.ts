import { Injectable } from '@nestjs/common';
import {
  AdicionalManoObraLiviano,
  AdicionalRepuestoLiviano,
  FiltrosListaAdicionalesLivianos,
  ICotizadorAdicionalesLivianosRepository,
} from '../../domain/cotizador-adicionales-livianos.repository';

export type { FiltrosListaAdicionalesLivianos } from '../../domain/cotizador-adicionales-livianos.repository';

export interface ListarAdicionalesLivianosResponse {
  repuestos: AdicionalRepuestoLiviano[];
  manoObra: AdicionalManoObraLiviano[];
}

@Injectable()
export class ListarAdicionalesLivianosUseCase {
  constructor(private readonly repo: ICotizadorAdicionalesLivianosRepository) {}

  async execute(
    filtros: FiltrosListaAdicionalesLivianos,
  ): Promise<ListarAdicionalesLivianosResponse> {
    const repuestos = await this.repo.listarRepuestos(filtros);
    const manoObra = await this.repo.listarManoObra(filtros);

    return { repuestos, manoObra };
  }
}
