export interface SedePresupuestoEntity {
  id: number;
  nombre: string;
}

export interface TipoPresupuestoEntity {
  id: number;
  nombre: string;
}

export interface CatalogosPresupuestoEntity {
  sedes: SedePresupuestoEntity[];
  tipos: TipoPresupuestoEntity[];
}

export interface PresupuestoMesRawEntity {
  mes: number;
  presupuesto: number;
  saldo: number;
}

export interface FiltrosPresupuestoEntity {
  anio: number;
  sedeId: number;
  tipoVh: number;
  tipoId?: number;
}

export interface CeldaEditableEntity {
  mes: number;
  mesLabel: string;
  anio: number;
  sedeId: number;
  tipoId: number;
  tipoVh: number;
}

export interface FilaTablaPresupuestoEntity {
  etiqueta: string;
  presupuesto: number | string | null;
  celdas: Record<string, number | string | null>;
  celdaPresupuestoEditable?: CeldaEditableEntity;
  celdaSaldoEditable?: CeldaEditableEntity;
}

export interface TablaPresupuestoEntity {
  titulo: string;
  editable: boolean;
  filtros: FiltrosPresupuestoEntity;
  filas: FilaTablaPresupuestoEntity[];
}

export interface ConsultarPresupuestoResponseEntity {
  puedeEditar: boolean;
  mesActualIndex: number;
  tablas: TablaPresupuestoEntity[];
}

export type MatrizFila = {
  Mes: string;
  Presupuesto: number | string | null;
} & Record<string, number | string | null>;
