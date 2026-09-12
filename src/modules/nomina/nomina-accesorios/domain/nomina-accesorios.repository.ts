export abstract class INominaAccesoriosRepository {
  abstract listarAuxiliar(
    ano: number,
    mes: number,
    nitFiltro: string | null,
  ): Promise<Record<string, unknown>[]>;

  abstract listarAsesor(
    ano: number,
    mes: number,
    nitFiltro: string | null,
  ): Promise<Record<string, unknown>[]>;

  abstract listarTecnicos(
    ano: number,
    mes: number,
    nitFiltro: string | null,
  ): Promise<Record<string, unknown>[]>;

  abstract listarOtrasMarcas(
    ano: number,
    mes: number,
    nitFiltro: string | null,
  ): Promise<Record<string, unknown>[]>;

  abstract listarMoInterna(
    ano: number,
    mes: number,
  ): Promise<Record<string, unknown>[]>;
}
