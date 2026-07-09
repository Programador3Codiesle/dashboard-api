import {
  BodegaCatalogoEntity,
  GraficoMensualRowEntity,
  TecnicoCatalogoEntity,
} from '../entities/informe-posibles-retornos.entity';

export abstract class IInformePosiblesRetornosRepository {
  abstract getTecnicos(): Promise<TecnicoCatalogoEntity[]>;
  abstract getBodegas(): Promise<BodegaCatalogoEntity[]>;
  abstract getNameTecnico(nit: string): Promise<string | null>;
  abstract entradaVsRetornos(year: number): Promise<GraficoMensualRowEntity[]>;
  abstract entradaVsRetornosByTecnico(
    year: number,
    nitTecnico: string,
    nameTecnico: string,
  ): Promise<GraficoMensualRowEntity[]>;
  abstract entradaVsRetornosBySede(
    year: number,
    sede: number,
  ): Promise<GraficoMensualRowEntity[]>;
}
