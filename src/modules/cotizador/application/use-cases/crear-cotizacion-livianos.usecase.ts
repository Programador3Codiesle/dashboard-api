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
    const idCotizacion = await this.repo.crearCotizacion(dto.general);
    await this.repo.agregarRepuestosCotizacion(idCotizacion, dto.repuestos);
    await this.repo.agregarManoObraCotizacion(idCotizacion, dto.manoObra);

    return { idCotizacion };
  }
}

