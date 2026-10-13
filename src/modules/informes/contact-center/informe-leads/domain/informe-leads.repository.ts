import type { PaginatedResult } from '../../../../../core/infra/pagination';
import type { InformeLead } from './informe-leads.entity';

export interface FiltrosInformeLeads {
  desde: string;
  hasta: string;
  pagina: number;
  limite: number;
}

export abstract class IInformeLeadsRepository {
  abstract listar(
    filtros: FiltrosInformeLeads,
  ): Promise<PaginatedResult<InformeLead>>;

  abstract listarRango(desde: string, hasta: string): Promise<InformeLead[]>;
}
