import { Injectable } from '@nestjs/common';
import { IMpviCotizacionRepository } from '../../../mpvi-shared/domain/mpvi-cotizacion.repository';
import { buildTablaCotizacionTecnico } from '../../../mpvi-shared/application/helpers/mpvi-tabla.builder';
import type { MpviTablaTecnico } from '../../../mpvi-shared/application/helpers/mpvi.types';
import type { ObtenerDatosDto } from '../dto/mpvi-tecnicos.dto';

@Injectable()
export class ObtenerDatosUseCase {
  constructor(private readonly repo: IMpviCotizacionRepository) {}

  async execute(params: ObtenerDatosDto): Promise<{
    tablaU: MpviTablaTecnico | null;
    tablaR: MpviTablaTecnico | null;
  }> {
    const cobrables = (params.cobrables ?? '')
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n));

    let tablaU: MpviTablaTecnico | null = null;
    let tablaR: MpviTablaTecnico | null = null;

    if (params.urgentes && params.urgentes.trim() !== '') {
      const manoObra = await this.repo.getValorManoObra(
        params.bod,
        params.placa,
        params.urgentes,
      );
      const repuestos = await this.repo.getValorRepuestos(
        params.bod,
        params.placa,
        params.urgentes,
      );
      tablaU = buildTablaCotizacionTecnico(
        manoObra,
        repuestos,
        cobrables,
        'U',
      );
    }

    if (params.recomendados && params.recomendados.trim() !== '') {
      const manoObra = await this.repo.getValorManoObra(
        params.bod,
        params.placa,
        params.recomendados,
      );
      const repuestos = await this.repo.getValorRepuestos(
        params.bod,
        params.placa,
        params.recomendados,
      );
      tablaR = buildTablaCotizacionTecnico(
        manoObra,
        repuestos,
        cobrables,
        'R',
      );
    }

    return { tablaU, tablaR };
  }
}
