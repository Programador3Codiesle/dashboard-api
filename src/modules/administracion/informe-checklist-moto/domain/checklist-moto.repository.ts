import { ChecklistMotoEntity } from './checklist-moto.entity';

export interface FiltrosChecklistMoto {
  fechaIni?: string | null;
  fechaFin?: string | null;
  sede?: string | null;
  pagina?: number | null;
  limite?: number | null;
}

export abstract class IChecklistMotoRepository {
  abstract listar(
    filtros: FiltrosChecklistMoto,
  ): Promise<{ items: ChecklistMotoEntity[]; total: number }>;
}

