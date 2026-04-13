export class NpsInternoMesTecnicoEntity {
  tecnicoNit: string;
  tecnicoNombre: string;
  sedeDescripcion: string;
  mes: number;
  enc0a6: number;
  enc7a8: number;
  enc9a10: number;
  totalEncuestas: number;
  nps: number;

  constructor(props: {
    tecnicoNit: string;
    tecnicoNombre: string;
    sedeDescripcion: string;
    mes: number;
    enc0a6: number;
    enc7a8: number;
    enc9a10: number;
  }) {
    this.tecnicoNit = props.tecnicoNit;
    this.tecnicoNombre = props.tecnicoNombre;
    this.sedeDescripcion = props.sedeDescripcion;
    this.mes = props.mes;
    this.enc0a6 = props.enc0a6;
    this.enc7a8 = props.enc7a8;
    this.enc9a10 = props.enc9a10;
    const total = props.enc0a6 + props.enc7a8 + props.enc9a10;
    this.totalEncuestas = total;
    this.nps = total > 0 ? ((props.enc9a10 - props.enc0a6) / total) * 100 : 0;
  }
}

export class NpsInternoTecnicoResumenEntity {
  tecnicoNit: string;
  tecnicoNombre: string;
  sedes: string;
  meses: NpsInternoMesTecnicoEntity[];

  constructor(props: {
    tecnicoNit: string;
    tecnicoNombre: string;
    sedes: string;
    meses: NpsInternoMesTecnicoEntity[];
  }) {
    this.tecnicoNit = props.tecnicoNit;
    this.tecnicoNombre = props.tecnicoNombre;
    this.sedes = props.sedes;
    this.meses = props.meses;
  }
}

/** Fila detalle como legacy Informe_nps / buscar_nps */
export class NpsInternoEncuestaDetalleEntity {
  nit: string;
  nombres: string;
  pregunta1: string;
  pregunta2: string;
  pregunta3: string;
  pregunta4: string;
  pregunta5: string;
  fecha: string;
  nOrden: string;
  bodega?: string | null;

  constructor(props: {
    nit: string;
    nombres: string;
    pregunta1: string;
    pregunta2: string;
    pregunta3: string;
    pregunta4: string;
    pregunta5: string;
    fecha: string;
    nOrden: string;
    bodega?: string | null;
  }) {
    this.nit = props.nit;
    this.nombres = props.nombres;
    this.pregunta1 = props.pregunta1;
    this.pregunta2 = props.pregunta2;
    this.pregunta3 = props.pregunta3;
    this.pregunta4 = props.pregunta4;
    this.pregunta5 = props.pregunta5;
    this.fecha = props.fecha;
    this.nOrden = props.nOrden;
    this.bodega = props.bodega ?? null;
  }
}
