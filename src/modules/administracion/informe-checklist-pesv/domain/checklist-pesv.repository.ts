import { ChecklistPesvEntity } from './checklist-pesv.entity';

export type TipoChecklistPesv = 'carro' | 'moto';

export interface FiltrosChecklistPesv {
  tipo: TipoChecklistPesv;
  placa?: string | null;
  fechaIni: string;
  fechaFin: string;
}

export abstract class IChecklistPesvRepository {
  abstract listar(
    filtros: FiltrosChecklistPesv,
  ): Promise<ChecklistPesvEntity[]>;
}
