export type TablaKeyEdicion =
  | 'livianos_repuesto'
  | 'livianos_mano_adicional'
  | 'livianos_mano_trabajos'
  | 'pesados_repuesto'
  | 'pesados_mano_adicional'
  | 'pesados_mano_trabajos';

export interface TablaConfigEntry {
  key: TablaKeyEdicion;
  tabla: string;
  columna_clase: string;
  filtros: string[];
  excluir: string[];
  columnas_editables: string[];
}

export interface FiltroOpcionRequest {
  tablaKey: TablaKeyEdicion;
  filtro: string;
  whereParcial: Record<string, string | number | null | undefined>;
}

export interface AplicarEdicionRequest {
  tablaKey: TablaKeyEdicion;
  filtros: Record<string, string | number>;
  campos: Record<string, string | number>;
}

export interface AplicarEdicionResult {
  affectedRows: number;
}

export abstract class ICotizadorEdicionConfigRepository {
  abstract getTablaConfig(): TablaConfigEntry[];

  abstract getClasesDistinct(
    tablaKey: TablaKeyEdicion,
  ): Promise<{ clase: string; descripcion: string | null }[]>;

  abstract getOpcionesFiltro(req: FiltroOpcionRequest): Promise<string[]>;

  abstract aplicarEdicion(
    req: AplicarEdicionRequest,
  ): Promise<AplicarEdicionResult>;
}
