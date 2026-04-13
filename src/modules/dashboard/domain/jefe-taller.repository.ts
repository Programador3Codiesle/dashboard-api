import type { VentasBodRow } from './dashboard.repository';

/**
 * Contrato de repositorio específico para el dashboard de Jefe de Taller.
 * Por ahora solo expone un método representativo para dejar lista la estructura.
 */
export abstract class IJefeTallerDashboardRepository {
  abstract getVentasBod(
    sedesIds: string,
    mes: number,
    ano: number,
  ): Promise<VentasBodRow | null>;
}
