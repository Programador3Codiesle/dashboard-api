import type { GrafSedesRow } from './dashboard.repository';

/**
 * Contrato de repositorio para el dashboard de Gerencia.
 * A futuro puede especializarse; por ahora reutiliza la vista de sedes.
 */
export abstract class IGerenciaDashboardRepository {
  abstract getGrafSedes(): Promise<GrafSedesRow[]>;
}
