import { TallaPersonalEntity } from './talla-personal.entity';

export abstract class ITallaPersonalRepository {
  abstract listar(): Promise<TallaPersonalEntity[]>;
}

