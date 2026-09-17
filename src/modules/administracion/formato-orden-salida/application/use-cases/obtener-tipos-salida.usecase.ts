import { Injectable } from '@nestjs/common';
import {
  AZUCENA_NIT,
  JEFES_TIPOS_SALIDAS,
  JEFES_TODOS_TIPOS,
  TIPOS_SALIDA,
} from '../orden-salida-php.constants';

export interface TipoSalida {
  id: number;
  descripcion: string;
}

@Injectable()
export class ObtenerTiposSalidaUseCase {
  /**
   * Replica `FormatosDigitales::generarComboTiposSalidas`.
   */
  execute(nitJefe: number): TipoSalida[] {
    const tipos = { ...TIPOS_SALIDA };
    if (nitJefe !== AZUCENA_NIT) {
      delete tipos[18];
    }

    const esJefeTodos = JEFES_TODOS_TIPOS.includes(nitJefe);
    if (esJefeTodos) {
      return Object.keys(tipos)
        .map((id) => Number(id))
        .sort((a, b) => a - b)
        .map((id) => ({ id, descripcion: tipos[id] }));
    }

    const ids = JEFES_TIPOS_SALIDAS[nitJefe];
    if (!ids) {
      return [];
    }

    return ids
      .filter((id) => tipos[id] != null)
      .map((id) => ({ id, descripcion: tipos[id] }));
  }
}
