export class ComisionJefeEntity {
  nit: string;
  nombres: string;
  sede: string;
  facturacionPosventa: number;
  internas: number;
  comisionPorFacturacion: number;
  utilidadSede: number;
  bonoUtilidad: number;
  utilidadRepuestos: number;
  comisionUtilidadBruta: number;
  bonoNps: number;
  bonoNpsInterno: number;
  total: number;

  constructor(props: ComisionJefeEntity) {
    Object.assign(this, props);
  }
}

export class DetalleComisionJefeEntity {
  nit: string;
  nombres: string;
  sede: string;
  repuestos: number;
  manoDeObra: number;

  constructor(props: DetalleComisionJefeEntity) {
    Object.assign(this, props);
  }
}

export class JefePorSedeEntity {
  nit: string;
  nombres: string;

  constructor(props: JefePorSedeEntity) {
    Object.assign(this, props);
  }
}

export class ValidacionBonosJefeEntity {
  bonoNps: number;
  bonoNpsInterno: number;
  bonoUtilidad: number;
  utilidadSede: number;

  constructor(props: ValidacionBonosJefeEntity) {
    Object.assign(this, props);
  }
}
