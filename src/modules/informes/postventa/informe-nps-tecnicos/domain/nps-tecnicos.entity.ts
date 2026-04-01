export class NpsTecnicoRowEntity {
  origen: 'nps_int' | 'nps_col';
  sede: string;
  tecnico: string;
  nps: number;
  enc0a6: number;
  enc7a8: number;
  enc9a10: number;
  mesNumero: number | null;
  mesNombre: string;

  constructor(props: {
    origen: 'nps_int' | 'nps_col';
    sede: string;
    tecnico: string;
    nps: number;
    enc0a6: number;
    enc7a8: number;
    enc9a10: number;
    mesNumero: number | null;
    mesNombre: string;
  }) {
    this.origen = props.origen;
    this.sede = props.sede;
    this.tecnico = props.tecnico;
    this.nps = props.nps;
    this.enc0a6 = props.enc0a6;
    this.enc7a8 = props.enc7a8;
    this.enc9a10 = props.enc9a10;
    this.mesNumero = props.mesNumero;
    this.mesNombre = props.mesNombre;
  }
}

