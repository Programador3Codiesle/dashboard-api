import { DesempenoEmpleadoEntity } from './desempeno-empleado.entity';

export interface FiltrosDesempenoEmpleado {
  anio: number;
  sede?: string | null;
}

export abstract class IDesempenoEmpleadoRepository {
  abstract listar(
    filtros: FiltrosDesempenoEmpleado,
  ): Promise<DesempenoEmpleadoEntity[]>;
}
