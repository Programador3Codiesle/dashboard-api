import { InformeHorarioEntity } from './informe-horario.entity';

export interface FiltrosInformeHorario {
  fechaIni: string;
  fechaFin: string;
  sede?: string | null;
  empleado?: string | null;
}

export abstract class IInformeHorarioRepository {
  abstract listar(params: FiltrosInformeHorario): Promise<InformeHorarioEntity[]>;
}

