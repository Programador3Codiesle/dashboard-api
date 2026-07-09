import { Module } from '@nestjs/common';
import { InformeBaseDatosFacade } from '../application/informe-base-datos.facade';
import { InformeBaseDatosController } from './informe-base-datos.controller';
import { InformeBaseDatosRepository } from './repositories/informe-base-datos.repository';

@Module({
  controllers: [InformeBaseDatosController],
  providers: [InformeBaseDatosRepository, InformeBaseDatosFacade],
})
export class InformeBaseDatosModule {}
