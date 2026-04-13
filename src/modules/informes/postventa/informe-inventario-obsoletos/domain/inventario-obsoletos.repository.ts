import {
  InventarioObsoletoDetalleEntity,
  InventarioObsoletoResumenEntity,
  TipoInventarioObsoleto,
} from './inventario-obsoletos.entity';

export abstract class IInventarioObsoletosRepository {
  abstract obtenerResumen(): Promise<InventarioObsoletoResumenEntity[]>;
  abstract obtenerDetalle(
    tipo: TipoInventarioObsoleto,
  ): Promise<InventarioObsoletoDetalleEntity[]>;
}
