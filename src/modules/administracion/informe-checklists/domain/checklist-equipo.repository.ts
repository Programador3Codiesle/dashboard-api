import { ChecklistEquipoEntity } from './checklist-equipo.entity';

export interface FiltrosChecklistEquipo {
  op: number; // 0 a 5 según get_inf_checks PHP
  fechaIni?: string | null;
  fechaFin?: string | null;
  idCheck?: number | null;
}

export abstract class IChecklistEquipoRepository {
  abstract listar(
    filtros: FiltrosChecklistEquipo,
  ): Promise<ChecklistEquipoEntity[]>;
}
