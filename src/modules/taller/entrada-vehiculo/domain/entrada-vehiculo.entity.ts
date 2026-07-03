export interface SedeUsuarioEntity {
  idsede: number;
  idsedeV: string;
  nombres: string;
  descripcion: string;
}

export interface CitaEntradaEntity {
  idCita: number;
  nomBodega: string;
  bodega: number;
  descripcionEstado: string;
  fechaCita: string;
  fechaHoraIni: Date;
  placa: string;
  vehiculo: string | null;
  nombreCliente: string | null;
  nombreEncargado: string | null;
  descripcionBahia: string | null;
  notas: string | null;
}

export interface VhSinOtEntity {
  fecha: string;
  placa: string;
  bodega: number;
  cliente: string | null;
  encargado: string | null;
  bahia: string | null;
  vh: string | null;
}

export interface VhSinCitaEntity {
  placa: string;
  nombreCliente: string;
  motivoVisita: string;
  fecha: string;
  bodegas: string | null;
}

export interface EntradaVehiculoPanelEntity {
  sedes: SedeUsuarioEntity[];
  citasProgramadas: CitaEntradaEntity[];
  citasAtendidas: CitaEntradaEntity[];
  citasSinOt: VhSinOtEntity[];
  vehiculosSinCita: VhSinCitaEntity[];
}
