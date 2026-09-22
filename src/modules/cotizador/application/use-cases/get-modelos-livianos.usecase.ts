import { Injectable } from '@nestjs/common';
import { ICotizadorLivianosRepository } from '../../domain/cotizador-livianos.repository';

@Injectable()
export class GetModelosLivianosUseCase {
  constructor(private readonly repo: ICotizadorLivianosRepository) {}

  async execute(descripcion: string): Promise<string[]> {
    const normalizada = descripcion.trim();
    if (!normalizada) {
      return [];
    }
    return this.repo.getModelosPorDescripcion(normalizada);
  }
}
