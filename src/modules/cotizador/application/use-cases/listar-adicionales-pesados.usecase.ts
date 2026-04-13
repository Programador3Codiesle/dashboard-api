import { Injectable } from '@nestjs/common';
import {
  AdicionalManoObraPesado,
  AdicionalRepuestoPesado,
  FiltrosListaAdicionalesPesados,
  ICotizadorAdicionalesPesadosRepository,
} from '../../domain/cotizador-adicionales-pesados.repository';

export type { FiltrosListaAdicionalesPesados } from '../../domain/cotizador-adicionales-pesados.repository';

export interface ListarAdicionalesPesadosResponse {
  repuestos: AdicionalRepuestoPesado[];
  manoObra: AdicionalManoObraPesado[];
}

@Injectable()
export class ListarAdicionalesPesadosUseCase {
  constructor(private readonly repo: ICotizadorAdicionalesPesadosRepository) {}

  async execute(
    filtros: FiltrosListaAdicionalesPesados,
  ): Promise<ListarAdicionalesPesadosResponse> {
    const [repuestos, manoObra] = await Promise.all([
      this.repo.listarRepuestos(filtros),
      this.repo.listarManoObra(filtros),
    ]);

    return { repuestos, manoObra };
  }
}
