import { Module } from '@nestjs/common';
import { InformeObsoletosFacade } from '../application/informe-obsoletos.facade';
import { InformeObsoletosController } from './informe-obsoletos.controller';
import { InformeObsoletosRepository } from './repositories/informe-obsoletos.repository';

@Module({
  controllers: [InformeObsoletosController],
  providers: [InformeObsoletosRepository, InformeObsoletosFacade],
})
export class InformeObsoletosModule {}
