import { Injectable } from '@nestjs/common';
import {
  FiltroOpcionRequest,
  ICotizadorEdicionConfigRepository,
} from '../../domain/cotizador-edicion-config.repository';

@Injectable()
export class GetEdicionFiltroOpcionesUseCase {
  constructor(private readonly repo: ICotizadorEdicionConfigRepository) {}

  async execute(req: FiltroOpcionRequest): Promise<string[]> {
    return this.repo.getOpcionesFiltro(req);
  }
}
