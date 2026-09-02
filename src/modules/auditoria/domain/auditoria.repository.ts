export type OrdenDiariaRow = {
  nombres: string;
  mantenimiento_preventivo: number;
  mantenimiento_correctivo: number;
  garantia: number;
  retorno: number;
  colision: number;
  interno: number;
};

export type EntregaRow = {
  mes: number;
  entregas: number;
  segunda_entrega: number;
};

export type FacturacionTallerRow = {
  ano: number;
  mes: number;
  bodega: string;
  descripcion: string;
  venta_rptos: number;
  presupuesto_rptos: number;
  venta_mano_obra: number;
  presupuesto_mano_obra: number;
  venta_tot: number;
  presupuesto_tot: number;
};

export type FacturacionTecnicoRow = FacturacionTallerRow & {
  nit: string;
  tecnico: string;
};

export type OrdenMttoRow = {
  ano: number;
  mes: number;
  sede: string;
  cantidad_ot: number;
  presupuesto_ordenes: number;
};

export type OrdenTecnicoRow = {
  ano: number;
  mes: number;
  bodega: string;
  descripcion: string;
  nit: string;
  nombres: string;
  ordenes: number;
  presupuesto_ordenes: number;
};

export type TecnicoOption = { nit: string; nombre: string };

export type NpsSedeDetalle = {
  sede: string;
  fecha: string;
  calificacion: number;
  enc06: number;
  enc78: number;
  enc910: number;
};

export type NpsSedeCalificacion = {
  sede: string;
  calificacion: number;
};

export type NpsTecnicoAgregado = {
  enc06: number;
  enc78: number;
  enc910: number;
};

export type NpsTecnicoDetalle = {
  nombres: string;
  enc06: number;
  enc78: number;
  enc910: number;
};

export abstract class IAuditoriaRepository {
  abstract ordenesDiarias(
    year: number,
    month: number,
    day: number,
    bodega: number,
  ): Promise<OrdenDiariaRow[]>;

  abstract entregas(ano: number, tipo: string): Promise<EntregaRow[]>;

  abstract facturacionTaller(bodega: number): Promise<FacturacionTallerRow[]>;

  abstract facturacionTecnico(params: {
    bodega?: number;
    tecnico?: string;
  }): Promise<FacturacionTecnicoRow[]>;

  abstract ordenesMttoPreventivo(bodega: number): Promise<OrdenMttoRow[]>;

  abstract ordenesTecnicos(params: {
    bodega?: number;
    tecnico?: string;
  }): Promise<OrdenTecnicoRow[]>;

  abstract listarTecnicos(): Promise<TecnicoOption[]>;

  abstract npsSedeCalificaciones(
    sede: string,
    year: number,
    month: number,
  ): Promise<NpsSedeCalificacion[]>;

  abstract npsSedeDetalle(
    sede: string,
    year: number,
    month: number,
  ): Promise<NpsSedeDetalle | null>;

  abstract npsTecnicoAgregado(
    sede: string,
    year: number,
    month: number,
  ): Promise<NpsTecnicoAgregado>;

  abstract npsTecnicoDetalle(
    sede: string,
    year: number,
    month: number,
  ): Promise<NpsTecnicoDetalle[]>;
}
