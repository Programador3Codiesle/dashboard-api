export class ComisionAsesorRepuestoEntity {
  sede: string;
  nombre: string;
  ventaNeta: number;
  margenBruto: number;
  utilidadBruta: number;
  comisionPorcentaje: number;
  valorComision: number;
  comisionVentasPorcentaje: number;
  valorComisionVentas: number;
  totalComision: number;
  color: string;

  constructor(props: ComisionAsesorRepuestoEntity) {
    Object.assign(this, props);
  }
}

export class DetalleComisionAsesorRepuestoEntity {
  nombre: string;
  subtotal: number;
  descuento: number;
  ventaNeta: number;
  costoNeto: number;
  utilidad: number;
  margenBruto: number;
  tipo: string;

  constructor(props: DetalleComisionAsesorRepuestoEntity) {
    Object.assign(this, props);
  }
}
