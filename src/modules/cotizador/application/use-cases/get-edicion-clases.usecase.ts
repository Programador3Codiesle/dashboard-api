import { Injectable } from '@nestjs/common';
import {
  ICotizadorEdicionConfigRepository,
  TablaKeyEdicion,
} from '../../domain/cotizador-edicion-config.repository';

export interface EdicionClaseOption {
  clase: string;
  descripcion: string | null;
}

@Injectable()
export class GetEdicionClasesUseCase {
  constructor(
    private readonly repo: ICotizadorEdicionConfigRepository,
  ) {}

  async execute(
    tablaKey: TablaKeyEdicion,
  ): Promise<EdicionClaseOption[]> {
    return this.repo.getClasesDistinct(tablaKey);
  }
}

