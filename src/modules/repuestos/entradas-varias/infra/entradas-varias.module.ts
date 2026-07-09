import { Module } from '@nestjs/common';
import { RepuestosSharedModule } from '../../shared/repuestos-shared.module';
import { EntradasVariasFacade } from '../application/entradas-varias.facade';
import { EntradasVariasController } from './entradas-varias.controller';

@Module({
  imports: [RepuestosSharedModule],
  controllers: [EntradasVariasController],
  providers: [EntradasVariasFacade],
})
export class EntradasVariasModule {}
