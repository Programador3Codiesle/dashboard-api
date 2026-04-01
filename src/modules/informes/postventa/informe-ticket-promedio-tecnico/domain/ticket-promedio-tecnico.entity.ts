export class TicketPromedioTecnicoRowEntity {
  operario: string;
  tecnico: string;
  sede: string;
  anio: number;
  mes: number;
  ventaRepuestos: number;
  ventaManoObra: number;
  ventaTotal: number;
  ordenesRepuestos: number;
  ordenesManoObra: number;
  totalOrdenes: number;
  promedioRepuestos: number;
  promedioManoObra: number;
  promedioTotal: number;

  constructor(props: TicketPromedioTecnicoRowEntity) {
    Object.assign(this, props);
  }
}

