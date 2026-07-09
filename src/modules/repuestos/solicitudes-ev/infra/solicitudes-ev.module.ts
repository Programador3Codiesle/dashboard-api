import { Module } from '@nestjs/common';
import { RepuestosSharedModule } from '../../shared/repuestos-shared.module';
import { SolicitudesEvFacade } from '../application/solicitudes-ev.facade';
import { SolicitudesEvController } from './solicitudes-ev.controller';

@Module({
  imports: [RepuestosSharedModule],
  controllers: [SolicitudesEvController],
  providers: [SolicitudesEvFacade],
})
export class SolicitudesEvModule {}
