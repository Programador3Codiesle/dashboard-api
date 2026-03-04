import { Injectable, NotFoundException } from '@nestjs/common';
import { ICotizadorLivianosRepository, VehiculoCotizacionLivianos } from '../../domain/cotizador-livianos.repository';

@Injectable()
export class GetVehiculoPorPlacaUseCase {
  constructor(private readonly repo: ICotizadorLivianosRepository) {}

  async execute(placa: string): Promise<VehiculoCotizacionLivianos> {
    const normalizada = placa.trim().toUpperCase();
    if (!normalizada) {
      throw new NotFoundException('La placa es requerida.');
    }

    const vehiculo = await this.repo.getVehiculoPorPlaca(normalizada);
    if (!vehiculo) {
      throw new NotFoundException('No se encontró información para la placa ingresada.');
    }

    return vehiculo;
  }
}

