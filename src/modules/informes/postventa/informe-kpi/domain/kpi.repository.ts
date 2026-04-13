import { KpiResumenEntity } from './kpi.entity';

export abstract class IKpiRepository {
  abstract obtenerResumen(): Promise<KpiResumenEntity>;
}
