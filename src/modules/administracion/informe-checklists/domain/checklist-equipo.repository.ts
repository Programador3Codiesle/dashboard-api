import { ChecklistEquipoEntity } from './checklist-equipo.entity';

export interface FiltrosChecklistEquipo {
  op: number; // 0 a 6 según tipo de checklist
  fechaIni?: string | null;
  fechaFin?: string | null;
  idCheck?: number | null;
}

export abstract class IChecklistEquipoRepository {
  abstract listar(
    filtros: FiltrosChecklistEquipo,
  ): Promise<ChecklistEquipoEntity[]>;
}
