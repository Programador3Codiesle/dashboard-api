import {
  EstadoOtCatalogoEntity,
  HistorialOtEntity,
  OrdenTallerAbiertaRowEntity,
  SedeUsuarioEntity,
} from './estado-taller.entity';

export abstract class IEstadoTallerRepository {
  abstract getSedesUsuario(
    nitUsuario: number,
    idEmpresa?: number,
  ): Promise<SedeUsuarioEntity[]>;

  abstract getOrdenesAbiertas(
    bodegaIds: number[],
  ): Promise<OrdenTallerAbiertaRowEntity[]>;

  abstract getTotalOrdenesAbiertas(bodegaIds: number[]): Promise<number>;

  abstract getEstadosCatalogo(): Promise<EstadoOtCatalogoEntity[]>;

  abstract getHistorialOt(numeroOrden: number): Promise<HistorialOtEntity[]>;

  abstract getDiffDiasFecha(fecha: string): Promise<number | null>;

  abstract getFecPromesaEntrega(numeroOrden: number): Promise<string | null>;

  abstract addEvento(data: {
    ot: number;
    notas: string;
    estado: string;
    fecha: string;
    proceso: string;
    fecPromesaEntrega: string | null;
  }): Promise<boolean>;

  abstract existeEstimado(numeroOrden: number): Promise<boolean>;

  abstract insertEstimado(
    userId: number,
    data: Record<string, unknown>,
  ): Promise<boolean>;

  abstract updateEstimado(
    userId: number,
    numeroOrden: number,
    data: Record<string, unknown>,
  ): Promise<boolean>;

  abstract getCotizacionesSacyr(numeroOrden: number): Promise<number[]>;

  abstract getCotizacionesSacyrBatch(
    numerosOrden: number[],
  ): Promise<Map<number, number[]>>;
}
