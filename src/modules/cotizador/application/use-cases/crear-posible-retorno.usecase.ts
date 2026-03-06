import { Injectable } from '@nestjs/common';
import { ICotizadorLivianosRepository } from '../../domain/cotizador-livianos.repository';

export interface CrearPosibleRetornoDTO {
  placa: string;
  tipo_retorno: number;
  observacion: string;
  bodega: number | null;
}

@Injectable()
export class CrearPosibleRetornoUseCase {
  constructor(private readonly repo: ICotizadorLivianosRepository) {}

  async execute(dto: CrearPosibleRetornoDTO, idUsuario: number): Promise<{ idRetorno: number }> {
    const idRetorno = await this.repo.crearPosibleRetorno({
      id_usuario: idUsuario,
      placa: dto.placa,
      observacion: dto.observacion,
      tipo_retorno: dto.tipo_retorno,
      bodega: dto.bodega,
    });
    return { idRetorno };
  }
}
