import { InformeEntradasSalidasEntity } from './informe-entradas-salidas.entity';

export interface FiltrosEntradasSalidas {
  sede: string;
  fechaIni: string;
  fechaFin: string;
  empleado?: string | null;
  pagina?: number;
  limite?: number;
}

/** Combo PHP horario.php: Usuarios::getUserAlls (nit + nombres). */
export interface EmpleadoComboEntradasSalidas {
  nit: string;
  nombres: string;
}

export abstract class IInformeEntradasSalidasRepository {
  abstract listar(
    params: FiltrosEntradasSalidas,
  ): Promise<InformeEntradasSalidasEntity[]>;
  abstract listarEmpleadosCombo(): Promise<EmpleadoComboEntradasSalidas[]>;
}
