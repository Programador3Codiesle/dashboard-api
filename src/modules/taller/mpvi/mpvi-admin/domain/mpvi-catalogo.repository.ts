export interface CatalogoOption {
  id: number;
  label: string;
}

export interface SubirTablasAuxiliaresResult {
  filasInsertadas: number;
  filasRechazadas: number;
  filasProcesadas: number;
}

export abstract class IMpviCatalogoRepository {
  abstract procesarSistema(sistema: string): Promise<number | null>;
  abstract procesarSubsistema(
    idSistema: number,
    subsistema: string,
  ): Promise<number | null>;
  abstract procesarVh(
    idSubsistema: number | null,
    idFamilia: number,
    clase: string,
    anoInicial: number | null,
    anoFinal: number | null,
  ): Promise<number | null>;
  abstract procesarManoObra(
    idSubsistema: number,
    idVh: number,
    idTempario: number,
    tiempo: number,
  ): Promise<number | null>;
  abstract procesarRepuestos(
    idSubsistema: number,
    idVh: number,
    codigo: string,
    cantidad: number,
  ): Promise<number | null>;
  abstract procesarReferencias(
    idRepuesto: number,
    alterno1: string,
    alterno2?: string | null,
    alterno3?: string | null,
  ): Promise<number | null>;
  abstract getSistemas(): Promise<CatalogoOption[]>;
  abstract getSubsistemas(): Promise<CatalogoOption[]>;
  abstract getFamiliasVh(): Promise<CatalogoOption[]>;
  abstract getVehiculos(): Promise<CatalogoOption[]>;
  abstract getRepuestos(): Promise<CatalogoOption[]>;
  abstract saveData(
    op: number,
    data: Record<string, unknown>,
  ): Promise<boolean | number>;
  abstract deleteDataTabla(tabla: number): Promise<void>;
  abstract almacenarDatosGmica(row: string[]): Promise<boolean>;
  abstract almacenarDatosRepuestos(row: string[]): Promise<boolean>;
  abstract almacenarDatosReemplazos(row: string[]): Promise<boolean>;
  abstract resolverIdVhCanonico(idVh: number): Promise<number | null>;
}
