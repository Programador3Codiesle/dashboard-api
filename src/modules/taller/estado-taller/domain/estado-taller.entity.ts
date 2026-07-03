export interface SedeUsuarioEntity {
  idsede: number;
  idsedeV: string;
  nombres: string;
  descripcion: string;
}

export interface OrdenTallerAbiertaRowEntity {
  bodega: string;
  numero: number;
  razon2: number | null;
  fechaHoraEntregaReal: string | null;
  notas: string;
  estado: string;
  proceso: string;
  fechaPromEnt: string | null;
  aseguradora: string;
  cliente: string;
  fecha: string | null;
  asesor: string;
  kilometraje: number | null;
  descripcionVehiculo: string;
  placa: string;
  diasOtAbierta: number;
  ventaManoObra: number;
  ventaRptos: number;
  ventaTot: number;
  vManoObraEst: number | null;
  vRptoEst: number | null;
  vTotEst: number | null;
  mesFactEst: number | null;
  diffDiasPromesa: number | null;
}

export interface OrdenTallerAbiertaEntity extends OrdenTallerAbiertaRowEntity {
  razon2Label: string;
  mesFacturaActual: string;
  diffDiasPromesa: number | null;
  rowTone: 'danger' | 'warning' | 'success' | null;
  borderEspera: boolean;
  cotizacionesSacyr: number[];
}

export interface EstadoOtCatalogoEntity {
  idEstado: number;
  estado: string;
}

export interface HistorialOtEntity {
  numero: number;
  asesor: string;
  estado: string;
  notas: string | null;
  fechaHist: string | null;
}

export interface EstadoTallerPanelEntity {
  sedes: SedeUsuarioEntity[];
  ordenes: OrdenTallerAbiertaEntity[];
  totalAbiertas: number;
}

export interface MutationResultEntity {
  ok: boolean;
  title: string;
  message: string;
  icon: 'success' | 'error' | 'warning';
}
