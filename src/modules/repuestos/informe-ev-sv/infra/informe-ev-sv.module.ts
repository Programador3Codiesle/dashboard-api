import { Module } from '@nestjs/common';
import { RepuestosSharedModule } from '../../shared/repuestos-shared.module';
import { InformeEvSvFacade } from '../application/informe-ev-sv.facade';
import { InformeEvSvController } from './informe-ev-sv.controller';

@Module({
  imports: [RepuestosSharedModule],
  controllers: [InformeEvSvController],
  providers: [InformeEvSvFacade],
})
export class InformeEvSvModule {}
