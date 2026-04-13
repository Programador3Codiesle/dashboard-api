import { Injectable } from '@nestjs/common';
import { IInventarioObsoletosRepository } from '../../domain/inventario-obsoletos.repository';
import {
  InventarioObsoletoDetalleEntity,
  InventarioObsoletoResumenEntity,
  TipoInventarioObsoleto,
} from '../../domain/inventario-obsoletos.entity';

@Injectable()
export class ObtenerInventarioObsoletosUseCase {
  constructor(private readonly repo: IInventarioObsoletosRepository) {}

  async executeResumen(): Promise<InventarioObsoletoResumenEntity[]> {
    return this.repo.obtenerResumen();
  }

  async executeDetalle(
    tipo: TipoInventarioObsoleto,
  ): Promise<InventarioObsoletoDetalleEntity[]> {
    return this.repo.obtenerDetalle(tipo);
  }
}
