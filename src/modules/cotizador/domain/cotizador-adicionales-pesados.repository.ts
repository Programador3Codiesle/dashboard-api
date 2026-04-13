export interface ClaseAdicionalPesado {
  clase: string;
  descripcion: string;
}

export interface AdicionalNombrePesado {
  id: number;
  adicional: string;
  estado: number;
}

export interface AdicionalRepuestoPesado {
  seq: number;
  clase: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  year_start: number;
  year_end: number;
  descuento: number | null;
  adicionalId: number;
  adicionalNombre: string;
  estado: number;
}

export interface AdicionalManoObraPesado {
  id: number;
  clase: string;
  operacion: string;
  tiempo: number;
  valor_menos_5anos: number;
  valor_mas_5anos: number;
  descuento: number | null;
  adicionalId: number;
  adicionalNombre: string;
  estado: number;
}

export interface FiltrosListaAdicionalesPesados {
  adicionalId?: number;
  clases?: string[];
}

export interface BulkRepuestoAdicionalPesadoInput {
  codigo: string;
  descripcion: string;
  cantidad: number;
  yearStart: number;
  yearEnd: number;
  descuento?: number | null;
}

export interface BulkManoObraAdicionalPesadoInput {
  operacion: string;
  tiempo: number;
  valorMenos5: number;
  valorMas5: number;
  descuento?: number | null;
}

export interface BulkResultAdicionalPesado {
  repuestos_add: number;
  repuestos_fail: number;
  mano_add: number;
  mano_fail: number;
}

export abstract class ICotizadorAdicionalesPesadosRepository {
  abstract getClasesPesados(): Promise<ClaseAdicionalPesado[]>;

  abstract getAdicionales(): Promise<AdicionalNombrePesado[]>;

  abstract existsAdicionalNombre(nombre: string): Promise<boolean>;

  abstract createAdicionalNombre(nombre: string): Promise<void>;

  abstract listarRepuestos(
    filtros: FiltrosListaAdicionalesPesados,
  ): Promise<AdicionalRepuestoPesado[]>;

  abstract listarManoObra(
    filtros: FiltrosListaAdicionalesPesados,
  ): Promise<AdicionalManoObraPesado[]>;

  abstract bulkInsert(
    adicionalId: number,
    clases: string[],
    repuestos: BulkRepuestoAdicionalPesadoInput[],
    manoObra: BulkManoObraAdicionalPesadoInput[],
  ): Promise<BulkResultAdicionalPesado>;
}
