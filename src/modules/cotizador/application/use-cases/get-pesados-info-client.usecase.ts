import { Injectable, NotFoundException } from '@nestjs/common';
import { ICotizadorPesadosRepository } from '../../domain/cotizador-pesados.repository';

export interface PesadosInfoClientResponse {
  vehiculo: any;
  revisiones: { revision: number }[];
}

@Injectable()
export class GetPesadosInfoClientUseCase {
  constructor(private readonly repo: ICotizadorPesadosRepository) {}

  async execute(placa: string): Promise<PesadosInfoClientResponse> {
    const normalizada = placa.trim().toUpperCase();
    if (!normalizada) {
      throw new NotFoundException('La placa es requerida.');
    }

    const vehiculo = await this.repo.getVehiculoPorPlaca(normalizada);
    if (!vehiculo) {
      throw new NotFoundException(
        'No se encontró información para la placa ingresada.',
      );
    }

    const revisiones = await this.repo.getRevisionesByClase(vehiculo.clase);

    return {
      vehiculo,
      revisiones,
    };
  }
}
