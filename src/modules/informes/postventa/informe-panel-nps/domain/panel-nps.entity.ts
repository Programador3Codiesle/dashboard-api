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

export type PanelNpsTablaRowTipo = 'sede' | 'tecnico';

export class PanelNpsTablaRowEntity {
  tipo: PanelNpsTablaRowTipo;
  sede: string;
  enc0a6: number;
  enc7a8: number;
  enc9a10: number;
  to: number;
  nps: number;
  meta: number;
  nitTecnico?: string;
  nombreTecnico?: string;

  constructor(props: {
    tipo?: PanelNpsTablaRowTipo;
    sede: string;
    enc0a6: number;
    enc7a8: number;
    enc9a10: number;
    to: number;
    nps: number;
    meta?: number;
    nitTecnico?: string;
    nombreTecnico?: string;
  }) {
    this.tipo = props.tipo ?? 'sede';
    this.sede = props.sede;
    this.enc0a6 = props.enc0a6;
    this.enc7a8 = props.enc7a8;
    this.enc9a10 = props.enc9a10;
    this.to = props.to;
    this.nps = props.nps;
    this.meta = props.meta ?? 80;
    this.nitTecnico = props.nitTecnico;
    this.nombreTecnico = props.nombreTecnico;
  }
}

/** Punto mensual en la matriz técnico × mes (null = sin celda, como legacy “-”). */
export interface PanelNpsPuntoTecnico {
  mes: number;
  nps: number | null;
}

export class TecnicoNpsPorSedeEntity {
  sede: string;
  nit: string;
  nombre: string;
  puntos: PanelNpsPuntoTecnico[];

  constructor(props: {
    sede: string;
    nit: string;
    nombre: string;
    puntos: PanelNpsPuntoTecnico[];
  }) {
    this.sede = props.sede;
    this.nit = props.nit;
    this.nombre = props.nombre;
    this.puntos = props.puntos;
  }
}

export class PanelNpsResumenEntity {
  /** Meses calendario (1–12) de la ventana de 6 meses, de más antiguo a más reciente (alinea series y matriz). */
  mesesVentana: number[];
  series: SedeSerieNpsEntity[];
  tabla: PanelNpsTablaRowEntity[];
  tecnicosPorSede: TecnicoNpsPorSedeEntity[];

  constructor(props: {
    mesesVentana: number[];
    series: SedeSerieNpsEntity[];
    tabla: PanelNpsTablaRowEntity[];
    tecnicosPorSede: TecnicoNpsPorSedeEntity[];
  }) {
    this.mesesVentana = props.mesesVentana;
    this.series = props.series;
    this.tabla = props.tabla;
    this.tecnicosPorSede = props.tecnicosPorSede;
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
