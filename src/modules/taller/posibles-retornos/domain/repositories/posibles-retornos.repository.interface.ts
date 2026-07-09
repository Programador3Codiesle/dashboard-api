import {
  CatalogosPosiblesRetornosEntity,
  DetallePlacaEntity,
  GuardarDefinicionInputEntity,
  ListarPosiblesRetornosResultEntity,
  SolucionRetornoEntity,
} from '../entities/posibles-retornos.entity';

export interface ListarPosiblesRetornosFilters {
  numero?: number;
  placa?: string;
  bodega?: number;
  start: number;
  length: number;
}

export abstract class IPosiblesRetornosRepository {
  abstract obtenerCatalogos(): Promise<CatalogosPosiblesRetornosEntity>;

  abstract listar(
    filters: ListarPosiblesRetornosFilters,
  ): Promise<ListarPosiblesRetornosResultEntity>;

  abstract obtenerDetallePorPlaca(placa: string): Promise<DetallePlacaEntity>;

  abstract guardarDefinicion(
    data: GuardarDefinicionInputEntity,
  ): Promise<boolean>;

  abstract obtenerSolucion(
    numero: number,
  ): Promise<SolucionRetornoEntity | null>;

  abstract cerrarBdc(
    idPosibleBdc: number,
    usuario: string,
    fecha: string,
  ): Promise<boolean>;
}
