import { Injectable, NotFoundException } from '@nestjs/common';
import { IMpviCotizacionRepository } from '../../../mpvi-shared/domain/mpvi-cotizacion.repository';
import { buildTablaServicio } from '../../../mpvi-shared/application/helpers/mpvi-tabla.builder';

@Injectable()
export class ObtenerDatosServicioUseCase {
  constructor(private readonly repo: IMpviCotizacionRepository) {}

  async execute(op: number, idCotizacion: number) {
    const encabezado = await this.repo.getEncabezado(idCotizacion);
    const resCotizacion = encabezado[0];

    if (!resCotizacion) {
      throw new NotFoundException('El id de cotización no está registrado.');
    }

    const quienVisualiza = op;

    const manoU = await this.repo.getValorManoObraPdf(
      resCotizacion.bod,
      resCotizacion.placa,
      resCotizacion.id,
      'U',
      quienVisualiza,
    );
    const repU = await this.repo.getValorRepuestosPdf(
      resCotizacion.bod,
      resCotizacion.placa,
      resCotizacion.id,
      'U',
      quienVisualiza,
    );
    const tablaU = buildTablaServicio(manoU, repU, 'U');

    const manoR = await this.repo.getValorManoObraPdf(
      resCotizacion.bod,
      resCotizacion.placa,
      resCotizacion.id,
      'R',
      quienVisualiza,
    );
    const repR = await this.repo.getValorRepuestosPdf(
      resCotizacion.bod,
      resCotizacion.placa,
      resCotizacion.id,
      'R',
      quienVisualiza,
    );
    const tablaR = buildTablaServicio(manoR, repR, 'R');

    return {
      correo: resCotizacion.correo,
      diasProxContacto: resCotizacion.dias_prox_contacto,
      nota: resCotizacion.nota,
      tablaU,
      tablaR,
    };
  }
}
