import { Injectable } from '@nestjs/common';
import { PqrNpsVehiculoInfoEntity } from '../../domain/pqr-nps.entity';
import { IPqrNpsRepository } from '../../domain/pqr-nps.repository';

@Injectable()
export class ObtenerInfoVehiculoUseCase {
  constructor(private readonly repo: IPqrNpsRepository) {}

  execute(placa: string): Promise<PqrNpsVehiculoInfoEntity | null> {
    return this.repo.obtenerInfoVehiculo(placa);
  }
}
