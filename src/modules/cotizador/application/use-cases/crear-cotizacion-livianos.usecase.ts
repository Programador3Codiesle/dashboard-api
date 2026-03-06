import { Injectable } from '@nestjs/common';
import {
  ICotizadorLivianosRepository,
  ManoObraCotizacionInput,
  NuevaCotizacionLivianos,
  RepuestoCotizacionInput,
} from '../../domain/cotizador-livianos.repository';

export interface CrearCotizacionLivianosDTO {
  general: Omit<NuevaCotizacionLivianos, 'fecha_creacion' | 'fecha_agenda'> & {
    fecha_creacion?: Date;
    fecha_agenda?: Date | null;
  };
  repuestos: RepuestoCotizacionInput[];
  manoObra: ManoObraCotizacionInput[];
}

@Injectable()
export class CrearCotizacionLivianosUseCase {
  constructor(private readonly repo: ICotizadorLivianosRepository) {}

  async execute(dto: CrearCotizacionLivianosDTO): Promise<{ idCotizacion: number }> {
    const now = dto.general.fecha_creacion ?? new Date();
    const agendar = dto.general.estado === 1;

    const estadoCotizacion = agendar ? 1 : 0;
    const fechaAgenda: Date | null = agendar ? now : null;

    const generalToSave: NuevaCotizacionLivianos = {
      ...dto.general,
      fecha_creacion: now,
      fecha_agenda: fechaAgenda,
      estado: estadoCotizacion,
    };

    const idCotizacion = await this.repo.crearCotizacion(generalToSave);
    await this.repo.agregarRepuestosCotizacion(idCotizacion, dto.repuestos);
    await this.repo.agregarManoObraCotizacion(idCotizacion, dto.manoObra);

    return { idCotizacion };
  }
}

