import { Injectable } from '@nestjs/common';
import {
  ICotizadorPesadosRepository,
  ManoObraCotizacionPesadosInput,
  NuevaCotizacionPesados,
  RepuestoCotizacionPesadosInput,
} from '../../domain/cotizador-pesados.repository';

export interface CrearCotizacionPesadosDTO {
  general: Omit<NuevaCotizacionPesados, 'fecha_creacion' | 'fecha_agenda'> & {
    fecha_creacion?: Date;
    fecha_agenda?: Date | null;
  };
  repuestos: RepuestoCotizacionPesadosInput[];
  manoObra: ManoObraCotizacionPesadosInput[];
}

@Injectable()
export class CrearCotizacionPesadosUseCase {
  constructor(private readonly repo: ICotizadorPesadosRepository) {}

  async execute(
    dto: CrearCotizacionPesadosDTO,
  ): Promise<{ idCotizacion: number }> {
    const idCotizacion = await this.repo.crearCotizacion(dto.general);
    await this.repo.agregarRepuestosCotizacion(idCotizacion, dto.repuestos);
    await this.repo.agregarManoObraCotizacion(idCotizacion, dto.manoObra);

    return { idCotizacion };
  }
}
