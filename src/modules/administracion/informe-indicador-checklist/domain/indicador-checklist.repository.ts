import { IndicadorChecklistEntity } from './indicador-checklist.entity';

export interface FiltrosIndicadorChecklist {
  op: number;
  sede?: string | null;
  fechaIni: string;
  fechaFin: string;
}

export abstract class IIndicadorChecklistRepository {
  abstract listar(
    filtros: FiltrosIndicadorChecklist,
  ): Promise<IndicadorChecklistEntity[]>;
}
