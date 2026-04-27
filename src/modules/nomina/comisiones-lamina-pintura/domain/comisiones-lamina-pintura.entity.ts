export class ComisionLaminaPinturaEntity {
  operario: string;
  nombres: string;
  descripcion: string;
  productividad: number;
  horasTrabajadas: number;
  horasProductivasMes: number;
  porcentajeLiquidacion: number;
  materiales: number;
  baseComisionMo: number;
  internas: number;
  comisionSinInternasMo: number;
  baseRepuestos: number;
  porcFacTotal: number;
  comisionRepuestos: number;
  pulidasLivianos: number;
  totalPulidoLivianos: number;
  pulidasPesados: number;
  totalPulidoPesados: number;
  vidrios: number;
  bonoNps: number;
  totalPagar: number;

  constructor(props: ComisionLaminaPinturaEntity) {
    Object.assign(this, props);
  }
}

export class DetalleComisionLaminaPinturaEntity {
  factura: string;
  numeroOrden: number;
  placa: string;
  vehiculo: string;
  productividad: number;
  porcentajeLiquidacion: number;
  tiempoFacturado: number;
  baseComision: number;
  materiales: number;
  internas: number;
  comisionPagar: number;

  constructor(props: DetalleComisionLaminaPinturaEntity) {
    Object.assign(this, props);
  }
}

export class TotalRepuestosSedeEntity {
  sede: number;
  total: number;

  constructor(props: TotalRepuestosSedeEntity) {
    Object.assign(this, props);
  }
}

