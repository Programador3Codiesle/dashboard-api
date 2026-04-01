import { Retencion720RowEntity } from './retencion-72-0.entity';

export abstract class IRetencion720Repository {
  abstract obtenerResumen(): Promise<Retencion720RowEntity[]>;
}

