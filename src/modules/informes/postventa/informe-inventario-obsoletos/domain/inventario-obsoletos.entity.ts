export type TipoInventarioObsoleto =
  | 'detalleRepLiv'
  | 'detalleRepPes'
  | 'detalleAccLiv'
  | 'detalleAccPes';

export class InventarioObsoletoResumenEntity {
  tipo: TipoInventarioObsoleto;
  descripcionTipo: string;
  obsoleto: number;
  total: number;
  porcentaje: number;
  habilitaDetalle: boolean;

  constructor(props: InventarioObsoletoResumenEntity) {
    Object.assign(this, props);
  }
}

export class InventarioObsoletoDetalleEntity {
  rnk: number;
  codigo: string;
  descripcion: string;
  linea: string;
  stock: number;
  bodega: number;
  costo: number;
  costoTotal: number;
  meses: number;
  pvpAntesIva: number;
  margen: number;
  acumulado: number;

  constructor(props: InventarioObsoletoDetalleEntity) {
    Object.assign(this, props);
  }
}
