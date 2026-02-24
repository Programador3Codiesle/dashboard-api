/**
 * Contrato de repositorio para el dashboard de Mantenimiento.
 */
export abstract class IMantenimientoDashboardRepository {
  abstract sPendientes(sedesIds: string): Promise<{ pendientes: number }>;
}

