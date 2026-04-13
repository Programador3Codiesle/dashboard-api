import { Injectable } from '@nestjs/common';
import {
  FiltrosTicketPromedioTecnico,
  ITicketPromedioTecnicoRepository,
} from '../../domain/ticket-promedio-tecnico.repository';
import { TicketPromedioTecnicoRowEntity } from '../../domain/ticket-promedio-tecnico.entity';

@Injectable()
export class ObtenerTicketPromedioTecnicoUseCase {
  constructor(
    private readonly ticketPromedioRepo: ITicketPromedioTecnicoRepository,
  ) {}

  async execute(
    filtros: FiltrosTicketPromedioTecnico,
  ): Promise<TicketPromedioTecnicoRowEntity[]> {
    return this.ticketPromedioRepo.obtenerDatos(filtros);
  }
}
