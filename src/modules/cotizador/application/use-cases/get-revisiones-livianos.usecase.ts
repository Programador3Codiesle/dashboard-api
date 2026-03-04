import { Injectable } from '@nestjs/common';
import { ICotizadorLivianosRepository, RevisionOption } from '../../domain/cotizador-livianos.repository';

@Injectable()
export class GetRevisionesLivianosUseCase {
  constructor(private readonly repo: ICotizadorLivianosRepository) {}

  async execute(clase: string): Promise<RevisionOption[]> {
    const normalizada = clase.trim();
    if (!normalizada) {
      return [];
    }
    return this.repo.getRevisionesPorClase(normalizada);
  }
}

