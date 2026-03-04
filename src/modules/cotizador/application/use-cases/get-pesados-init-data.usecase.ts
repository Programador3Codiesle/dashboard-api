import { Injectable } from '@nestjs/common';
import { ICotizadorPesadosRepository } from '../../domain/cotizador-pesados.repository';

export interface PesadosInitData {
  clases: { clase: string; descripcion: string }[];
}

@Injectable()
export class GetPesadosInitDataUseCase {
  constructor(private readonly repo: ICotizadorPesadosRepository) {}

  async execute(): Promise<PesadosInitData> {
    const clases = await this.repo.getClasesDescripcion();
    return { clases };
  }
}

