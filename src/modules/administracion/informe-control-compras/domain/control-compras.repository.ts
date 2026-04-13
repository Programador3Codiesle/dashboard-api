import { ControlComprasEntity } from './control-compras.entity';

export abstract class IControlComprasRepository {
  abstract listarPorOrden(
    orden: number,
    pagina?: number | null,
    limite?: number | null,
  ): Promise<{ items: ControlComprasEntity[]; total: number }>;
}
