/**
 * Contrato de repositorio para el dashboard de Compras.
 */
export abstract class IComprasDashboardRepository {
  abstract getCantSolicitudesCompras(estados: string): Promise<{ n: number }>;
}
