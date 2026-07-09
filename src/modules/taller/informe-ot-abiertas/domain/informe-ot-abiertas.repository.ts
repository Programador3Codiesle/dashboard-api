import {
  AsesorOtCountEntity,
  OrdenAbiertaInformeEntity,
  TotalBodegaEntity,
} from './informe-ot-abiertas.entity';

export abstract class IInformeOtAbiertasRepository {
  abstract getOrdenesAbiertas(
    bodegaIds: number[],
  ): Promise<OrdenAbiertaInformeEntity[]>;

  abstract getCountPorBodega(bodegaIds: number[]): Promise<TotalBodegaEntity[]>;

  abstract getCountPorAsesor(bodegaId: number): Promise<AsesorOtCountEntity[]>;
}
