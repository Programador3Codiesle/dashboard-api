import { Injectable } from '@nestjs/common';
import { ObtenerTicketPromedioTecnicoUseCase } from './use-cases/obtener-ticket-promedio-tecnico.usecase';
import { FiltrosTicketPromedioTecnico } from '../domain/ticket-promedio-tecnico.repository';

@Injectable()
export class TicketPromedioTecnicoFacade {
  constructor(
    private readonly obtenerTicketPromedioTecnicoUseCase: ObtenerTicketPromedioTecnicoUseCase,
  ) {}

  obtenerTicketPromedio(filtros: FiltrosTicketPromedioTecnico) {
    return this.obtenerTicketPromedioTecnicoUseCase.execute(filtros);
  }
}

