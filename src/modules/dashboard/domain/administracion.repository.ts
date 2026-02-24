import type { GrafSedesRow } from './dashboard.repository';

/**
 * Contrato de repositorio para el dashboard de Administración.
 * Por ahora solo se declara un método básico para ir desacoplando.
 */
export abstract class IAdministracionDashboardRepository {
  abstract getGrafSedes(): Promise<GrafSedesRow[]>;
}

