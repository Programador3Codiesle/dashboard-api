import { Injectable } from '@nestjs/common';
import { IMpviCotizacionRepository } from '../../../mpvi-shared/domain/mpvi-cotizacion.repository';

@Injectable()
export class ObtenerItemsUseCase {
  constructor(private readonly repo: IMpviCotizacionRepository) {}

  async execute(placa: string) {
    const subsistemas = await this.repo.getSubsistemasByVh(placa);
    const dataCliente = await this.repo.getDatosByPlaca(placa);

    if (subsistemas.length > 0) {
      return {
        ok: true,
        subsistemas: subsistemas.map((s) => ({
          id: s.id,
          subsistema: s.subsistema,
        })),
        nombre: dataCliente?.nombres ?? '',
        celular: dataCliente?.celular ?? '',
        correo: dataCliente?.mail ?? '',
        desc_vh: dataCliente?.descripcion ?? '',
      };
    }

    const mensaje =
      dataCliente === null
        ? 'La placa no está registrada en el sistema. Debe registrar el vehículo o verificar la placa.'
        : 'Esta placa no tiene ítems MPVI configurados para cotización.';

    return { ok: false, mensaje };
  }
}
