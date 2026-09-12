import { TipoInformeNominaAccesorios } from './nomina-accesorios.constants';

export class NominaAccesoriosAuxiliarEntity {
  fecha: string;
  nombres: string;
  ventaPropia: number;
  ventaCompartida: number;
  comisionPropia: number;
  comisionCompartida: number;
  totalComision: number;

  constructor(props: NominaAccesoriosAuxiliarEntity) {
    Object.assign(this, props);
  }
}

export class NominaAccesoriosAsesorEntity {
  fecha: string;
  documento: string;
  nombres: string;
  ventaPropia: number;
  ventaCompartida: number;
  vhEntregados: number;
  comisionPropia: number;
  comisionCompartida: number;
  totalComision: number;
  /** null = PHP `N/A` (sin VH entregados). */
  shareAccesorios: number | null;

  constructor(props: NominaAccesoriosAsesorEntity) {
    Object.assign(this, props);
  }
}

export class NominaAccesoriosTecnicoEntity {
  fecha: string;
  nombres: string;
  totalHoras: number;
  comision: number;

  constructor(props: NominaAccesoriosTecnicoEntity) {
    Object.assign(this, props);
  }
}

export class NominaAccesoriosOtrasMarcasEntity {
  fecha: string;
  vendedor: string;
  ventaAccesorios: number;
  comision: number;

  constructor(props: NominaAccesoriosOtrasMarcasEntity) {
    Object.assign(this, props);
  }
}

export class NominaAccesoriosMoInternaEntity {
  fecha: string;
  agencia: string;
  tiempo: number;
  total: number;

  constructor(props: NominaAccesoriosMoInternaEntity) {
    Object.assign(this, props);
  }
}

export class NominaAccesoriosResultadoEntity {
  tipo: TipoInformeNominaAccesorios;
  fechaLabel: string;
  emptyMessage: string;
  auxiliar: NominaAccesoriosAuxiliarEntity[];
  asesor: NominaAccesoriosAsesorEntity[];
  tecnicos: NominaAccesoriosTecnicoEntity[];
  otrasMarcas: NominaAccesoriosOtrasMarcasEntity[];
  moInterna: NominaAccesoriosMoInternaEntity[];

  constructor(props: NominaAccesoriosResultadoEntity) {
    Object.assign(this, props);
  }
}
