export interface InformeAsesorRowEntity {
  nit: string;
  nombres: string;
  venta_taller: number;
  costo_taller: number;
  venta_mostrador: number;
  costo_mostrador: number;
  salario: number;
  fecha_ini: string;
  dias: number;
}

export interface ComparacionAsesorRowEntity {
  nit: string;
  nombres: string;
  venta_taller: number;
  costo_taller: number;
  venta_mostrador: number;
  costo_mostrador: number;
}

export interface InformeAsesorCalculadoEntity {
  rnk: number;
  nombres: string;
  venta_taller: number;
  costo_taller: number;
  utilidad_taller: number;
  utilidad_taller_ant: number;
  venta_mostrador: number;
  costo_mostrador: number;
  utilidad_mostrador: number;
  utilidad_mostrador_ant: number;
  utilidad_total: number;
  utilidad_total_ant: number;
  salario: number;
  fecha_ini: string;
  dias: number;
}

export interface GenerarInformeResponseEntity {
  yearComparar: number;
  filas: InformeAsesorCalculadoEntity[];
}
