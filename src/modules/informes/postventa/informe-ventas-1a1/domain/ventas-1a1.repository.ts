import { Ventas1a1AsesorEntity, Ventas1a1RowEntity } from './ventas-1a1.entity';

export interface FiltrosVentas1a1 {
  year: number;
  asesor?: string | null;
}

export abstract class IVentas1a1Repository {
  abstract obtenerAsesores(): Promise<Ventas1a1AsesorEntity[]>;

  abstract obtenerInforme(
    filtros: FiltrosVentas1a1,
  ): Promise<Ventas1a1RowEntity[]>;
}
