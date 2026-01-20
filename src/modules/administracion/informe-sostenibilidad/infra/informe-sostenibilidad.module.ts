import { Module } from '@nestjs/common';
import { InformeSostenibilidadController } from './informe-sostenibilidad.controller';
import { InformeSostenibilidadFacade } from '../application/informe-sostenibilidad.facade';

@Module({
    controllers: [InformeSostenibilidadController],
    providers: [InformeSostenibilidadFacade],
    exports: [InformeSostenibilidadFacade]
})
export class InformeSostenibilidadModule { }
