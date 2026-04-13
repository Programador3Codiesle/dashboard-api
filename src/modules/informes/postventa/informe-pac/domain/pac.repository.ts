import { PacResumenEntity } from './pac.entity';

export abstract class IPacRepository {
  abstract obtenerResumen(): Promise<PacResumenEntity>;
}
