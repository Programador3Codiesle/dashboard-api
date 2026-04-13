import { Injectable } from '@nestjs/common';
import { IRetencion720Repository } from '../../domain/retencion-72-0.repository';
import { Retencion720RowEntity } from '../../domain/retencion-72-0.entity';

@Injectable()
export class ObtenerRetencion720UseCase {
  constructor(private readonly repository: IRetencion720Repository) {}

  execute(): Promise<Retencion720RowEntity[]> {
    return this.repository.obtenerResumen();
  }
}
