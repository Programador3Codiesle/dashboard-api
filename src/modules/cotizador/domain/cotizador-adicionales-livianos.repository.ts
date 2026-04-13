export interface ClaseAdicionalLiviano {
  clase: string;
  descripcion: string;
}

export interface AdicionalNombreLiviano {
  id: number;
  adicional: string;
  estado: number;
}

export interface AdicionalRepuestoLiviano {
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

export interface AdicionalManoObraLiviano {
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

export interface FiltrosListaAdicionalesLivianos {
  adicionalId?: number;
  clases?: string[];
}

export interface BulkRepuestoAdicionalLivianoInput {
  codigo: string;
  descripcion: string;
  cantidad: number;
  yearStart: number;
  yearEnd: number;
  descuento?: number | null;
}

export interface BulkManoObraAdicionalLivianoInput {
  operacion: string;
  tiempo: number;
  valorMenos5: number;
  valorMas5: number;
  descuento?: number | null;
}

export interface BulkResultAdicionalLiviano {
  repuestos_add: number;
  repuestos_fail: number;
  mano_add: number;
  mano_fail: number;
}

export interface CodigoRepuestoValidationResult {
  response: 'success' | 'error';
  codigo?: string;
  alterno?: string | null;
}

export interface UpdateRepuestoAdicionalInput {
  seq: number;
  userId: number;
  descripcion: string;
  cantidad: number;
  yearStart: number;
  yearEnd: number;
  descuento?: number | null;
}

export interface UpdateManoObraAdicionalInput {
  id: number;
  userId: number;
  operacion: string;
  tiempo: number;
  valorMenos5: number;
  valorMas5: number;
  descuento?: number | null;
}

export abstract class ICotizadorAdicionalesLivianosRepository {
  abstract getClasesAdicionales(): Promise<ClaseAdicionalLiviano[]>;

  abstract getAdicionales(): Promise<AdicionalNombreLiviano[]>;

  abstract existsAdicionalNombre(nombre: string): Promise<boolean>;

  abstract createAdicionalNombre(nombre: string): Promise<void>;

  abstract listarRepuestos(
    filtros: FiltrosListaAdicionalesLivianos,
  ): Promise<AdicionalRepuestoLiviano[]>;

  abstract listarManoObra(
    filtros: FiltrosListaAdicionalesLivianos,
  ): Promise<AdicionalManoObraLiviano[]>;

  abstract bulkInsert(
    adicionalId: number,
    userId: number,
    clases: string[],
    repuestos: BulkRepuestoAdicionalLivianoInput[],
    manoObra: BulkManoObraAdicionalLivianoInput[],
  ): Promise<BulkResultAdicionalLiviano>;

  abstract updateAdicionalEstado(id: number, estado: number): Promise<void>;

  abstract validateCodigoRepuesto(
    codigo: string,
  ): Promise<CodigoRepuestoValidationResult>;

  abstract deleteRepuestoAdicional(
    seq: number,
    codigo: string,
    adicionalId: number,
    userId: number,
  ): Promise<void>;

  abstract deleteManoObraAdicional(
    id: number,
    operacion: string,
    adicionalId: number,
    userId: number,
  ): Promise<void>;

  abstract updateRepuestoAdicional(
    input: UpdateRepuestoAdicionalInput,
  ): Promise<void>;

  abstract updateManoObraAdicional(
    input: UpdateManoObraAdicionalInput,
  ): Promise<void>;
}
