import {
  ComparacionTecnicoRowEntity,
  InformeTecnicoRowEntity,
} from '../entities/pyg-tecnicos.entity';

export abstract class IPygTecnicosRepository {
  abstract getDataInforme(
    yearOne: number,
    monthOne: number,
    monthTwo: number,
  ): Promise<InformeTecnicoRowEntity[]>;

  abstract getComparacionInforme(
    yearTwo: number,
    monthOne: number,
    monthTwo: number,
  ): Promise<ComparacionTecnicoRowEntity[]>;
}
