import { Injectable } from '@nestjs/common';
import { IPanelNpsRepository } from '../../domain/panel-nps.repository';
import { PanelNpsResumenEntity } from '../../domain/panel-nps.entity';

@Injectable()
export class ObtenerPanelNpsUseCase {
  constructor(private readonly repository: IPanelNpsRepository) {}

  execute(): Promise<PanelNpsResumenEntity> {
    return this.repository.obtenerPanel();
  }
}
