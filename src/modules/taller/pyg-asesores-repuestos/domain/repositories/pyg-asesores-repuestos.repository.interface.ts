import {
  ComparacionAsesorRowEntity,
  InformeAsesorRowEntity,
} from '../entities/pyg-asesores-repuestos.entity';

export abstract class IPygAsesoresRepuestosRepository {
  abstract getDataInformeAsesor(
    yearOne: number,
    monthOne: number,
    monthTwo: number,
    idEmpresa: number,
  ): Promise<InformeAsesorRowEntity[]>;

  abstract getComparacionInformeAsesor(
    yearTwo: number,
    monthOne: number,
    monthTwo: number,
    idEmpresa: number,
  ): Promise<ComparacionAsesorRowEntity[]>;
}
