export class InventarioObsoletoRowEntity {
  codigo: string;
  descripcion: string;
  stock: number;
  bodega: number;
  costoUnitario: number;
  costoPromedio: number;
  pvp: number;
  margen: number;
  meses: number;

  constructor(props: InventarioObsoletoRowEntity) {
    Object.assign(this, props);
  }
}

