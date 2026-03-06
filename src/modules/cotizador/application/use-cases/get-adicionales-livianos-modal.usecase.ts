import { Injectable } from '@nestjs/common';
import { ICotizadorLivianosRepository } from '../../domain/cotizador-livianos.repository';

export interface GetAdicionalesLivianosModalParams {
  clase: string;
  bodega: number;
  adicional: number;
  year: number;
}

export interface GetAdicionalesLivianosModalResult {
  soloManoObra: boolean;
  repuestos: any[];
  manoObra: any[];
}

@Injectable()
export class GetAdicionalesLivianosModalUseCase {
  constructor(private readonly repo: ICotizadorLivianosRepository) {}

  async execute(params: GetAdicionalesLivianosModalParams): Promise<GetAdicionalesLivianosModalResult> {
    const soloManoObra = await this.repo.getAdicionalOnlyMo(params.adicional);
    const repuestos = soloManoObra
      ? []
      : await this.repo.getRepuestosAdicionales(
          params.clase,
          params.bodega,
          params.adicional,
          params.year,
        );
    const manoObra = await this.repo.getManoObraAdicional(params.clase, params.adicional);
    return {
      soloManoObra,
      repuestos,
      manoObra,
    };
  }
}
