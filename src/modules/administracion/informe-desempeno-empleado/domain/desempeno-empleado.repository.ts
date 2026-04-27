import { DesempenoEmpleadoEntity } from './desempeno-empleado.entity';

export interface FiltrosDesempenoEmpleado {
  anio: number;
  sede?: string | null;
  pagina?: number;
  limite?: number;
}

export interface ListarDesempenoEmpleadoResultado {
  items: DesempenoEmpleadoEntity[];
  total: number;
}

export interface CompetenciaDesempenoDetalle {
  key: string;
  label: string;
  empleado: number;
  jefe: number;
}

export interface DesempenoEmpleadoDetalle {
  id: number;
  nitEmpleado: number;
  empleado: string;
  area: string;
  cargo: string;
  sede: string;
  fecha: string;
  calificado: number;
  jefe: string;
  calificacionEmpleado: number;
  calificacionJefe: number;
  calificacionFinal: number;
  capacidadesEntrenamiento: string | null;
  compromisos: string | null;
  competencias: CompetenciaDesempenoDetalle[];
}

export abstract class IDesempenoEmpleadoRepository {
  abstract listar(
    filtros: FiltrosDesempenoEmpleado,
  ): Promise<ListarDesempenoEmpleadoResultado>;

  abstract obtenerDetalle(id: number): Promise<DesempenoEmpleadoDetalle | null>;
}
