import { BadRequestException, Injectable } from '@nestjs/common';
import {
  AplicarEdicionRequest,
  AplicarEdicionResult,
  ICotizadorEdicionConfigRepository,
  TablaKeyEdicion,
} from '../../domain/cotizador-edicion-config.repository';

@Injectable()
export class AplicarEdicionConfigUseCase {
  constructor(
    private readonly repo: ICotizadorEdicionConfigRepository,
  ) {}

  async execute(req: AplicarEdicionRequest): Promise<AplicarEdicionResult> {
    const tablaKey: TablaKeyEdicion = req.tablaKey;

    if (!req.filtros || !Object.keys(req.filtros).length) {
      throw new BadRequestException(
        'Debe indicar al menos un filtro para aplicar la edición.',
      );
    }

    if (!req.campos || !Object.keys(req.campos).length) {
      throw new BadRequestException(
        'Debe indicar al menos un campo a editar.',
      );
    }

    const result = await this.repo.aplicarEdicion({
      tablaKey,
      filtros: req.filtros,
      campos: req.campos,
    });

    if (result.affectedRows < 0) {
      throw new BadRequestException(
        'Configuración de filtros o campos no válida para esta tabla.',
      );
    }

    return result;
  }
}

