import { Module } from '@nestjs/common';
import { InformeSostenibilidadController } from './informe-sostenibilidad.controller';
import { InformeSostenibilidadFacade } from '../application/informe-sostenibilidad.facade';
import { IInformeSostenibilidadRepository } from '../domain/informe-sostenibilidad.repository';
import { InformeSostenibilidadRepository } from './repositories/informe-sostenibilidad.repository';

@Module({
  controllers: [InformeSostenibilidadController],
  providers: [
    InformeSostenibilidadFacade,
    {
      provide: IInformeSostenibilidadRepository,
      useClass: InformeSostenibilidadRepository,
    },
  ],
  exports: [InformeSostenibilidadFacade],
})
export class InformeSostenibilidadModule {}
