export class Retencion720RowEntity {
  tipoVh: string;
  p0_12: number;
  e0_12: number;
  p13_24: number;
  e13_24: number;
  p25_36: number;
  e25_36: number;
  p37_48: number;
  e37_48: number;
  p49_60: number;
  e49_60: number;
  p61_72: number;
  e61_72: number;

  constructor(props: {
    tipoVh: string;
    p0_12: number;
    e0_12: number;
    p13_24: number;
    e13_24: number;
    p25_36: number;
    e25_36: number;
    p37_48: number;
    e37_48: number;
    p49_60: number;
    e49_60: number;
    p61_72: number;
    e61_72: number;
  }) {
    this.tipoVh = props.tipoVh;
    this.p0_12 = props.p0_12;
    this.e0_12 = props.e0_12;
    this.p13_24 = props.p13_24;
    this.e13_24 = props.e13_24;
    this.p25_36 = props.p25_36;
    this.e25_36 = props.e25_36;
    this.p37_48 = props.p37_48;
    this.e37_48 = props.e37_48;
    this.p49_60 = props.p49_60;
    this.e49_60 = props.e49_60;
    this.p61_72 = props.p61_72;
    this.e61_72 = props.e61_72;
  }
}

/** Fila con agregados por tipo/segmento y tipo_vh (filtros Autos/B&C, familia, Vs). */
export class Retencion720FiltroRowEntity {
  tipo?: string;
  segmento?: string;
  familiaVh?: string;
  tipoVh: string;
  p0_12: number;
  e0_12: number;
  p13_24: number;
  e13_24: number;
  p25_36: number;
  e25_36: number;
  p37_48: number;
  e37_48: number;
  p49_60: number;
  e49_60: number;
  p61_72: number;
  e61_72: number;

  constructor(props: {
    tipo?: string;
    segmento?: string;
    familiaVh?: string;
    tipoVh: string;
    p0_12: number;
    e0_12: number;
    p13_24: number;
    e13_24: number;
    p25_36: number;
    e25_36: number;
    p37_48: number;
    e37_48: number;
    p49_60: number;
    e49_60: number;
    p61_72: number;
    e61_72: number;
  }) {
    this.tipo = props.tipo;
    this.segmento = props.segmento;
    this.familiaVh = props.familiaVh;
    this.tipoVh = props.tipoVh;
    this.p0_12 = props.p0_12;
    this.e0_12 = props.e0_12;
    this.p13_24 = props.p13_24;
    this.e13_24 = props.e13_24;
    this.p25_36 = props.p25_36;
    this.e25_36 = props.e25_36;
    this.p37_48 = props.p37_48;
    this.e37_48 = props.e37_48;
    this.p49_60 = props.p49_60;
    this.e49_60 = props.e49_60;
    this.p61_72 = props.p61_72;
    this.e61_72 = props.e61_72;
  }
}

export class Retencion720VehiculoRowEntity {
  placa: string | null;
  serie: string | null;
  codigo: string | null;
  familia: string | null;
  tipoVh: string | null;
  cumpleRetencion: string;

  constructor(props: {
    placa: string | null;
    serie: string | null;
    codigo: string | null;
    familia: string | null;
    tipoVh: string | null;
    cumpleRetencion: string;
  }) {
    this.placa = props.placa;
    this.serie = props.serie;
    this.codigo = props.codigo;
    this.familia = props.familia;
    this.tipoVh = props.tipoVh;
    this.cumpleRetencion = props.cumpleRetencion;
  }
}

export type Retencion720TablaGeneralRow = Record<string, unknown>;
