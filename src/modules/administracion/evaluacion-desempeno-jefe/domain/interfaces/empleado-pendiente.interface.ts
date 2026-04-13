export interface EmpleadoPendiente {
  id_empleado: number;
  nit: number;
  nombre: string;
  tiene_evaluacion: boolean;
  id_evaluacion?: bigint;
}
