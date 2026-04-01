export interface PanelNpsPunto {
  mes: number;
  nps: number;
}

export class SedeSerieNpsEntity {
  sede: string;
  puntos: PanelNpsPunto[];

  constructor(props: { sede: string; puntos: PanelNpsPunto[] }) {
    this.sede = props.sede;
    this.puntos = props.puntos;
  }
}

export class PanelNpsTablaRowEntity {
  sede: string;
  enc0a6: number;
  enc7a8: number;
  enc9a10: number;
  to: number;
  nps: number;
  meta: number;

  constructor(props: {
    sede: string;
    enc0a6: number;
    enc7a8: number;
    enc9a10: number;
    to: number;
    nps: number;
    meta?: number;
  }) {
    this.sede = props.sede;
    this.enc0a6 = props.enc0a6;
    this.enc7a8 = props.enc7a8;
    this.enc9a10 = props.enc9a10;
    this.to = props.to;
    this.nps = props.nps;
    this.meta = props.meta ?? 80;
  }
}

export class PanelNpsResumenEntity {
  series: SedeSerieNpsEntity[];
  tabla: PanelNpsTablaRowEntity[];

  constructor(props: {
    series: SedeSerieNpsEntity[];
    tabla: PanelNpsTablaRowEntity[];
  }) {
    this.series = props.series;
    this.tabla = props.tabla;
  }
}

export class PanelNpsDetalleEntity {
  scope: 'tecnico' | 'sede' | 'general';
  titulo: string;
  sede: string | null;
  mesNumero: number;
  mesNombre: string;
  enc0a6: number;
  enc7a8: number;
  enc9a10: number;

  constructor(props: {
    scope: 'tecnico' | 'sede' | 'general';
    titulo: string;
    sede: string | null;
    mesNumero: number;
    mesNombre: string;
    enc0a6: number;
    enc7a8: number;
    enc9a10: number;
  }) {
    this.scope = props.scope;
    this.titulo = props.titulo;
    this.sede = props.sede;
    this.mesNumero = props.mesNumero;
    this.mesNombre = props.mesNombre;
    this.enc0a6 = props.enc0a6;
    this.enc7a8 = props.enc7a8;
    this.enc9a10 = props.enc9a10;
  }
}


