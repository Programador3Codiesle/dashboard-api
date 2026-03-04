import { Injectable } from '@nestjs/common';
import {
  ICotizadorEdicionConfigRepository,
  TablaConfigEntry,
} from '../../domain/cotizador-edicion-config.repository';

@Injectable()
export class GetEdicionTablasUseCase {
  constructor(
    private readonly repo: ICotizadorEdicionConfigRepository,
  ) {}

  async execute(): Promise<TablaConfigEntry[]> {
    return this.repo.getTablaConfig();
  }
}

