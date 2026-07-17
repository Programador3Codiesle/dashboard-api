/** Configuración hardcodeada legacy: real_time_sedes + real_time_taller */

export type SedeCardConfig = {
  /** Nombre mostrado y query param hacia talleres */
  sede: string;
  /** Nombre en tabla presupuesto */
  metaSede: string;
  centrosTotal: number[];
  centrosRepTaller: number[];
  centrosMostrador: number[];
  /** Si false: sin tabla TOT/MO/REP ni link a talleres (SOLOCHEVROLET / CHEVROPARTES) */
  conDetalleTaller: boolean;
};

export type TallerCardConfig = {
  nombre: string;
  metaSede: string;
  centros: number[];
  esMostrador: boolean;
};

export const SEDES_DETALLE: SedeCardConfig[] = [
  {
    sede: 'CODIESEL PRINCIPAL',
    metaSede: 'CODIESEL PRINCIPAL',
    centrosTotal: [4, 40, 33, 45, 3],
    centrosRepTaller: [4, 40, 33, 45],
    centrosMostrador: [3],
    conDetalleTaller: true,
  },
  {
    sede: 'CODIESEL LA ROSITA',
    metaSede: 'CODIESEL LA ROSITA',
    centrosTotal: [16, 17],
    centrosRepTaller: [16],
    centrosMostrador: [17],
    conDetalleTaller: true,
  },
  {
    sede: 'CODIESEL VILLA DEL ROSARIO',
    metaSede: 'CODIESEL VILLA DEL ROSARIO',
    centrosTotal: [29, 80, 31, 46, 28],
    centrosRepTaller: [29, 80, 31, 46],
    centrosMostrador: [28],
    conDetalleTaller: true,
  },
  {
    sede: 'CODIESEL BARRANCABERMEJA',
    metaSede: 'CODIESEL BARRANCABERMEJA',
    centrosTotal: [13, 70, 11],
    centrosRepTaller: [13, 70],
    centrosMostrador: [11],
    conDetalleTaller: true,
  },
  {
    sede: 'SOLOCHEVROLET',
    metaSede: 'SOLOCHEVROLET MOSTRADOR',
    centrosTotal: [60],
    centrosRepTaller: [60],
    centrosMostrador: [],
    conDetalleTaller: false,
  },
  {
    sede: 'CHEVROPARTES',
    metaSede: 'CHEVROPARTES MOSTRADOR',
    centrosTotal: [15],
    centrosRepTaller: [15],
    centrosMostrador: [],
    conDetalleTaller: false,
  },
];

export const TALLERES_POR_SEDE: Record<string, TallerCardConfig[]> = {
  'CODIESEL PRINCIPAL': [
    {
      nombre: 'TALLER DIESEL GIRON',
      metaSede: 'GIRON DIESEL EXPRESS',
      centros: [40],
      esMostrador: false,
    },
    {
      nombre: 'TALLER GASOLINA GIRON',
      metaSede: 'GIRON GASOLINA',
      centros: [4],
      esMostrador: false,
    },
    {
      nombre: 'TALLER LAMINA Y PINTURA GIRON',
      metaSede: 'GIRON LAMINA Y PINTURA',
      centros: [33, 45],
      esMostrador: false,
    },
    {
      nombre: 'REPUESTOS MOSTRADOR GIRON',
      metaSede: 'GIRON REPUESTOS MOSTRADOR',
      centros: [3],
      esMostrador: true,
    },
  ],
  'CODIESEL LA ROSITA': [
    {
      nombre: 'ROSITA CHEVYEXPRESS',
      metaSede: 'ROSITA CHEVY ESPRES',
      centros: [16],
      esMostrador: false,
    },
    {
      nombre: 'REPUESTOS MOSTRADOR ROSITA',
      metaSede: 'ROSITA REPUESTOS MOSTRADOR',
      centros: [17],
      esMostrador: true,
    },
  ],
  'CODIESEL VILLA DEL ROSARIO': [
    {
      nombre: 'TALLER DIESEL BOCONO',
      metaSede: 'DIESEL EXPRESS BOCONO',
      centros: [80],
      esMostrador: false,
    },
    {
      nombre: 'TALLER GASOLINA BOCONO',
      metaSede: 'BOCONO GASOLINA',
      centros: [29],
      esMostrador: false,
    },
    {
      nombre: 'TALLER LAMINA Y PINTURA BOCONO',
      metaSede: 'BOCONO LAMINA Y PINTURA',
      centros: [31, 46],
      esMostrador: false,
    },
    {
      nombre: 'REPUESTOS MOSTRADOR BOCONO',
      metaSede: 'BOCONO REPUESTOS MOSTRADOR',
      centros: [28],
      esMostrador: true,
    },
  ],
  'CODIESEL BARRANCABERMEJA': [
    {
      nombre: 'TALLER DIESEL BARRANCA',
      metaSede: 'BARRANCA DIESEL EXPRESS',
      centros: [70],
      esMostrador: false,
    },
    {
      nombre: 'TALLER GASOLINA BARRANCA',
      metaSede: 'BARRANCA CHEVRY EXPRESS',
      centros: [13],
      esMostrador: false,
    },
    {
      nombre: 'REPUESTOS MOSTRADOR BARRANCA',
      metaSede: 'BARRANCA REPUESTOS MOSTRADOR',
      centros: [11],
      esMostrador: true,
    },
  ],
};

/** Nivel 4 — real_time_tipo_op: REPUESTOS / TOT / MO por taller */
export type TipoOpBodegaConfig = {
  centros: number[];
  metaRep: string;
  metaTot: string;
  metaMo: string;
};

export const TIPO_OP_POR_BODEGA: Record<string, TipoOpBodegaConfig> = {
  'TALLER GASOLINA GIRON': {
    centros: [4],
    metaRep: 'REPUESTOS GASOLINA GIRON',
    metaTot: 'TOT GASOLINA GIRON',
    metaMo: 'MO GASOLINA GIRON',
  },
  'TALLER DIESEL GIRON': {
    centros: [40],
    metaRep: 'REPUESTOS DIESEL GIRON',
    metaTot: 'TOT DIESEL GIRON',
    metaMo: 'MO DIESEL GIRON',
  },
  'TALLER LAMINA Y PINTURA GIRON': {
    centros: [33, 45],
    metaRep: 'REPUESTOS LYP GIRON',
    metaTot: 'TOT LYP GIRON',
    metaMo: 'MO LYP GIRON',
  },
  'ROSITA CHEVYEXPRESS': {
    centros: [16],
    metaRep: 'REPUESTOS ROSITA',
    metaTot: 'TOT ROSITA',
    metaMo: 'MO ROSITA',
  },
  'TALLER DIESEL BOCONO': {
    centros: [80],
    // Legacy usa espacio no estándar (NBSP) entre DIESEL y BOCONO
    metaRep: 'REPUESTOS DIESEL\u00A0BOCONO',
    metaTot: 'TOT DIESEL BOCONO',
    metaMo: 'MO DIESEL BOCONO',
  },
  'TALLER GASOLINA BOCONO': {
    centros: [29],
    metaRep: 'REPUESTOS GASOLINA BOCONO',
    metaTot: 'TOT GASOLINA BOCONO',
    metaMo: 'MO GASOLINA BOCONO',
  },
  'TALLER LAMINA Y PINTURA BOCONO': {
    centros: [31, 46],
    metaRep: 'REPUESTOS LYP BOCONO',
    metaTot: 'TOT LYP BOCONO',
    metaMo: 'MO LYP BOCONO',
  },
  'TALLER DIESEL BARRANCA': {
    centros: [70],
    metaRep: 'REPUESTOS DIESEL BARRANCA',
    metaTot: 'TOT DIESEL BARRANCA',
    metaMo: 'MO DIESEL BARRANCA',
  },
  'TALLER GASOLINA BARRANCA': {
    centros: [13],
    metaRep: 'REPUESTOS GASOLINA BARRANCA',
    metaTot: 'TOT GASOLINA BARRANCA',
    metaMo: 'MO GASOLINA BARRANCA',
  },
};
