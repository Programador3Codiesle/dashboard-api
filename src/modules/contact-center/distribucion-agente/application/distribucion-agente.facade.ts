import { Injectable } from '@nestjs/common';
import { DistribucionAgenteRepository } from '../infra/repositories/distribucion-agente.repository';

@Injectable()
export class DistribucionAgenteFacade {
  constructor(private readonly repo: DistribucionAgenteRepository) {}

  getGaActuales(nitAgente: number) {
    return this.repo.getGaActuales(nitAgente);
  }
}
