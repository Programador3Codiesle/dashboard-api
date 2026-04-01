import { InformeEntradasSalidasEntity } from './informe-entradas-salidas.entity';

export interface FiltrosEntradasSalidas {
  sede: string;
  fechaIni: string;
  fechaFin: string;
  empleado?: string | null;
}

export abstract class IInformeEntradasSalidasRepository {
  abstract listar(params: FiltrosEntradasSalidas): Promise<InformeEntradasSalidasEntity[]>;
}

