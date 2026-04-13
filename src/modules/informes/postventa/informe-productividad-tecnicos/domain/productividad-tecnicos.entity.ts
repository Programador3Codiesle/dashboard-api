export class ProductividadTecnicoRowEntity {
  nit: string;
  nombres: string;
  patio: number;
  horasCliente: number;
  horasGarantia: number;
  horasServicio: number;
  horasInterno: number;
  totalHoras: number;
  horasDisponibles: number;
  productividad: number;

  constructor(props: {
    nit: string;
    nombres: string;
    patio: number;
    horasCliente: number;
    horasGarantia: number;
    horasServicio: number;
    horasInterno: number;
    totalHoras: number;
    horasDisponibles: number;
    productividad: number;
  }) {
    this.nit = props.nit;
    this.nombres = props.nombres;
    this.patio = props.patio;
    this.horasCliente = props.horasCliente;
    this.horasGarantia = props.horasGarantia;
    this.horasServicio = props.horasServicio;
    this.horasInterno = props.horasInterno;
    this.totalHoras = props.totalHoras;
    this.horasDisponibles = props.horasDisponibles;
    this.productividad = props.productividad;
  }
}

export class ProductividadTecnicosResponseEntity {
  actual: ProductividadTecnicoRowEntity[];
  consolidado: ProductividadTecnicoRowEntity[];

  constructor(props: {
    actual: ProductividadTecnicoRowEntity[];
    consolidado: ProductividadTecnicoRowEntity[];
  }) {
    this.actual = props.actual;
    this.consolidado = props.consolidado;
  }
}
