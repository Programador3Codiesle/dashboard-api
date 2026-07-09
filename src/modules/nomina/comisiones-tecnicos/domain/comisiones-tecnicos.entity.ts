export class ComisionTecnicoEntity {
  nit: string;
  tecnico: string;
  patio: string;
  cargo: string;
  ventaRepuestos: number;
  ventaManoObra: number;
  comisionRepuestos: number;
  comisionManoObra: number;
  segundaEntrega: number;
  bonoNps: number;
  instalacionAccesorios: number;
  internas: number;
  alineaciones: number;
  balanceos: number;
  total: number;

  constructor(props: ComisionTecnicoEntity) {
    Object.assign(this, props);
  }
}

export class DetalleComisionTecnicoEntity {
  factura: string;
  numeroOrden: number;
  placa: string;
  vehiculo: string;
  operacion: string;
  nombreOperacion: string;
  ventaRepuestos: number;
  ventaManoObra: number;
  segundaEntrega: number;
  instalacionAccesorios: number;
  internas: number;

  constructor(props: DetalleComisionTecnicoEntity) {
    Object.assign(this, props);
  }
}
