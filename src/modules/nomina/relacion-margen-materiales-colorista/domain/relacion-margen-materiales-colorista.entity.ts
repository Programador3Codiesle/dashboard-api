export class RelacionMargenMaterialColoristaEntity {
  ano: number;
  mes: number;
  nombreMes: string;
  bodega: number;
  numeroOrden: number;
  valor: number;
  costo: number;
  margen: number;

  constructor(props: RelacionMargenMaterialColoristaEntity) {
    Object.assign(this, props);
  }
}

export class ResumenRelacionMargenMaterialColoristaEntity {
  totalValor: number;
  totalCosto: number;
  margenTotal: number;
  bono: number;

  constructor(props: ResumenRelacionMargenMaterialColoristaEntity) {
    Object.assign(this, props);
  }
}

export class RelacionMargenMaterialesColoristaResponseEntity {
  rows: RelacionMargenMaterialColoristaEntity[];
  resumen: ResumenRelacionMargenMaterialColoristaEntity;

  constructor(props: RelacionMargenMaterialesColoristaResponseEntity) {
    Object.assign(this, props);
  }
}
