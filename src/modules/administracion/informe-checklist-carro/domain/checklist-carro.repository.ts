import { ChecklistCarroEntity } from './checklist-carro.entity';

export interface FiltrosChecklistCarro {
  fechaIni?: string | null;
  fechaFin?: string | null;
  sede?: string | null;
  pagina?: number | null;
  limite?: number | null;
  /** JWT `sub` → id_usuario (legacy `id_user`) */
  idUsuario?: number | null;
  /** JWT `nit` → nit empleado (legacy `nit_user`) */
  nitUsuario?: string | null;
  /** JWT `role` → perfil_postventa numérico (legacy `perfil`) */
  perfil?: number | null;
}

export abstract class IChecklistCarroRepository {
  abstract listar(
    filtros: FiltrosChecklistCarro,
  ): Promise<{ items: ChecklistCarroEntity[]; total: number }>;
}
