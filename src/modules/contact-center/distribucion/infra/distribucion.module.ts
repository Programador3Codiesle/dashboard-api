import { Module } from '@nestjs/common';
import { DistribucionFacade } from '../application/distribucion.facade';
import { DistribucionController } from './distribucion.controller';
import { DistribucionRepository } from './repositories/distribucion.repository';

@Module({
  controllers: [DistribucionController],
  providers: [DistribucionRepository, DistribucionFacade],
})
export class DistribucionModule {}
