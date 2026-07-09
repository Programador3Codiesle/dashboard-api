export interface InformeTecnicoRowEntity {
  nit: string;
  taller: string;
  nombre: string;
  mano_obra: number;
  repuestos: number;
  costo_rep: number;
  costo_tot: number;
  costo_mo: number;
  entradas: number;
  horas_cliente: number;
  horas_garantia: number;
  horas_internas: number;
  horas_servicio: number;
  fecha_ini: string;
  dias_vacaciones: number;
}

export interface ComparacionTecnicoRowEntity {
  nit: string;
  utilidad_anterior: number;
}

export interface InformeTecnicoCalculadoEntity {
  rnk: number;
  taller: string;
  nombre: string;
  mano_obra: number;
  repuestos: number;
  utilidad: number;
  utilidad_year: number;
  ticket_total: number;
  horas_cliente: number;
  horas_garantia: number;
  horas_internas: number;
  horas_servicio: number;
  total_horas: number;
  valor_hora: number;
  fecha_ini: string;
  dias_vacaciones: number;
  costo_mo: number;
}

export interface GenerarInformeTecnicosResponseEntity {
  yearComparar: number;
  filas: InformeTecnicoCalculadoEntity[];
}
