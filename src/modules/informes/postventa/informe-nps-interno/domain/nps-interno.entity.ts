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

