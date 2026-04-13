import { InformeControlVehicularEntity } from './informe-control-vehicular.entity';

export interface FiltrosControlVehicular {
  page: number;
  limit: number;
  buscador?: string | null;
  fechaIni?: string | null;
  fechaFin?: string | null;
  porteria?: string | null;
}

export abstract class IInformeControlVehicularRepository {
  abstract listar(filtros: FiltrosControlVehicular): Promise<{
    items: InformeControlVehicularEntity[];
    total: number;
    page: number;
    limit: number;
  }>;

  abstract findById(id: number): Promise<InformeControlVehicularEntity | null>;

  abstract listarParaExcel(
    filtros: FiltrosControlVehicular,
  ): Promise<InformeControlVehicularEntity[]>;
}
