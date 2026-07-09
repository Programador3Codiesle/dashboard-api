export interface RazonRetornoEntity {
  id_razon: number;
  razon: string;
  definicion: number;
}

export interface SistemaInvEntity {
  id_sistema_inv: number;
  sistema_inv: string;
}

export interface PlanAccionEntity {
  id_plan: number;
  plan_accion: string;
}

export interface BodegaCatalogoEntity {
  bodega: number;
  descripcion: string;
}

export interface CatalogosPosiblesRetornosEntity {
  razones: RazonRetornoEntity[];
  sistemas: SistemaInvEntity[];
  planes: PlanAccionEntity[];
  bodegas: BodegaCatalogoEntity[];
}

export interface PosibleRetornoFilaEntity {
  rn: number;
  numero: number;
  placa: string;
  des_modelo: string;
  origen: string;
  descripcion: string;
  estado: string;
}

export interface ListarPosiblesRetornosResultEntity {
  total: number;
  filas: PosibleRetornoFilaEntity[];
}

export interface DetalleClienteEntity {
  placa: string;
  des_modelo: string;
  cliente: string;
  cant_retornos: number;
}

export interface DetalleOrdenEntity {
  rnk: number;
  placa: string;
  numero: number;
  solicitud: string;
  respuesta: string;
}

export interface DetalleTecnicoEntity {
  rnk: number;
  placa: string;
  numero: number;
  tecnicos: string;
}

export interface DetallePlacaEntity {
  cliente: DetalleClienteEntity;
  ordenes: DetalleOrdenEntity[];
  tecnicos: DetalleTecnicoEntity[];
  array_ordenes: number[];
  array_tecnicos: string[];
}

export interface GuardarDefinicionInputEntity {
  definicion: number | null;
  id_razon: number | null;
  obs_razon: string | null;
  id_sist_inv: number | null;
  obs_sist_inv: string | null;
  numero_retorno: number | null;
  numero: number | null;
  tecnico: string | null;
  id_plan: number | null;
  obs_plan: string | null;
  repuestos: number | null;
  mano_obra: number | null;
  tot: number | null;
  obs_costo: string | null;
  fecha_creacion: string;
  usuario: string;
}

export interface SolucionRetornoEntity {
  numero: number | null;
  definicion: number | null;
  razon: string | null;
  obs_razon: string | null;
  sistema_inv: string | null;
  obs_sist_inv: string | null;
  plan_accion: string | null;
  obs_plan: string | null;
  repuestos: number | null;
  mano_obra: number | null;
  tot: number | null;
  obs_costo: string | null;
  tecnico: string | null;
  numero_retorno: number | null;
  fecha_creacion: string | null;
  nombres: string | null;
}
