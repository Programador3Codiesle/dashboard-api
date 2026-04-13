import { TicketPromedioTecnicoRowEntity } from './ticket-promedio-tecnico.entity';

export interface FiltrosTicketPromedioTecnico {
  year: number;
  month: number;
  patio: string; // 'all' o id numérico en string
}

export abstract class ITicketPromedioTecnicoRepository {
  abstract obtenerDatos(
    filtros: FiltrosTicketPromedioTecnico,
  ): Promise<TicketPromedioTecnicoRowEntity[]>;
}
