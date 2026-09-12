import { Injectable } from '@nestjs/common';
import { IPacRepository } from '../../domain/pac.repository';
import { PacResumenEntity } from '../../domain/pac.entity';

@Injectable()
export class ObtenerPacUseCase {
  constructor(private readonly repo: IPacRepository) {}

  execute(empresaId: number): Promise<PacResumenEntity> {
    return this.repo.obtenerResumen(empresaId);
  }
}
