import { Injectable } from '@nestjs/common';
import { IInformeSostenibilidadRepository } from '../domain/informe-sostenibilidad.repository';

@Injectable()
export class InformeSostenibilidadFacade {
  constructor(
    private readonly informeSostenibilidadRepository: IInformeSostenibilidadRepository,
  ) {}

  obtenerRutaArchivo(): string {
    return this.informeSostenibilidadRepository.obtenerRutaArchivo();
  }
}
