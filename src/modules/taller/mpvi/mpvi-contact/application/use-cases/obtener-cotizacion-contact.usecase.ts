import { Injectable } from '@nestjs/common';
import { IMpviCotizacionRepository } from '../../../mpvi-shared/domain/mpvi-cotizacion.repository';

@Injectable()
export class ObtenerCotizacionContactUseCase {
  constructor(private readonly repo: IMpviCotizacionRepository) {}

  async execute(placa?: string | null) {
    const placaNorm =
      placa != null && placa.trim() !== '' ? placa.trim() : null;
    const cotizaciones = await this.repo.getCotizacionContact(placaNorm);

    const rows = await Promise.all(
      cotizaciones.map(async (key) => {
        const creador = await this.repo.getCreadorCotizacion(key.id);
        return {
          id: key.id,
          placa: key.placa,
          nombre: key.nombre,
          celular: key.celular,
          correo: key.correo,
          tecnico: creador?.nombres ?? '',
          nota: key.nota ?? '',
          fechaContacto: key.fecha_contacto,
          diasRestantes: key.dias_restantes,
        };
      }),
    );

    return { cotizaciones: rows };
  }
}
