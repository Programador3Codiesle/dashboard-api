import { Injectable } from '@nestjs/common';
import { IMpviCotizacionRepository } from '../../../mpvi-shared/domain/mpvi-cotizacion.repository';

@Injectable()
export class ObtenerCotizacionContactUseCase {
  constructor(private readonly repo: IMpviCotizacionRepository) {}

  async execute(placa?: string | null) {
    const placaNorm =
      placa != null && placa.trim() !== '' ? placa.trim() : null;
    const cotizaciones = await this.repo.getCotizacionContact(placaNorm);

    const rows: Array<{
      id: number;
      placa: string;
      nombre: string;
      celular: string;
      correo: string;
      tecnico: string;
      nota: string;
      fechaContacto: string;
      diasRestantes: number;
    }> = [];
    for (const key of cotizaciones) {
      const creador = await this.repo.getCreadorCotizacion(key.id);
      rows.push({
        id: key.id,
        placa: key.placa,
        nombre: key.nombre,
        celular: key.celular,
        correo: key.correo,
        tecnico: creador?.nombres ?? '',
        nota: String(key.nota ?? ''),
        fechaContacto:
          key.fecha_contacto instanceof Date
            ? key.fecha_contacto.toISOString()
            : String(key.fecha_contacto ?? ''),
        diasRestantes: Number(key.dias_restantes ?? 0),
      });
    }

    return { cotizaciones: rows };
  }
}
