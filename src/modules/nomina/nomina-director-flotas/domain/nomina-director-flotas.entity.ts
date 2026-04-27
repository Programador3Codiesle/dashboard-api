export class NominaDirectorFlotasPrincipalEntity {
  item: number;
  nit: string;
  nombres: string;
  placa: string;
  venta: number;

  constructor(props: NominaDirectorFlotasPrincipalEntity) {
    Object.assign(this, props);
  }
}

export class NominaDirectorFlotasDetalleEntity {
  item: number;
  nit: string;
  nombres: string;

  constructor(props: NominaDirectorFlotasDetalleEntity) {
    Object.assign(this, props);
  }
}

