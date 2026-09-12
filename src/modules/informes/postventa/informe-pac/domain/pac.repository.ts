import { PacResumenEntity } from './pac.entity';

export abstract class IPacRepository {
  abstract obtenerResumen(empresaId: number): Promise<PacResumenEntity>;
}
