export interface OrdenAbiertaInformeEntity {
  numero: number;
  bodega: string;
  cliente: string;
  asesor: string;
  fecha: string | null;
  vehiculo: string;
}

export interface TotalSedeEntity {
  sede: string;
  label: string;
  total: number;
}

export interface TotalBodegaEntity {
  bodegaId: number;
  descripcion: string;
  total: number;
}

export interface AsesorOtCountEntity {
  nombres: string;
  total: number;
}

export interface InformeGeneralEntity {
  totalesSedes: TotalSedeEntity[];
  totalGeneral: number;
  ordenes: OrdenAbiertaInformeEntity[];
}

export interface InformePorSedeEntity {
  sede: string;
  sedeLabel: string;
  totalesBodegas: TotalBodegaEntity[];
  ordenes: OrdenAbiertaInformeEntity[];
}

export interface InformePorTallerEntity {
  bodegaId: number;
  asesores: AsesorOtCountEntity[];
}
