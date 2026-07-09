import { Module } from '@nestjs/common';
import { DistribucionAgenteFacade } from '../application/distribucion-agente.facade';
import { DistribucionAgenteController } from './distribucion-agente.controller';
import { DistribucionAgenteRepository } from './repositories/distribucion-agente.repository';

@Module({
  controllers: [DistribucionAgenteController],
  providers: [DistribucionAgenteRepository, DistribucionAgenteFacade],
})
export class DistribucionAgenteModule {}
