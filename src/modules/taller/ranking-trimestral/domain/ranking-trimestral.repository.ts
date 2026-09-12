export type RankingTrimestralMesRow = {
  anio: number;
  mes: number;
  operario: string;
  tecnico: string;
  horasFacturadas: number;
  sumaTodo: number;
};

export abstract class IRankingTrimestralRepository {
  abstract listar(
    ano: number,
    meses: number[],
  ): Promise<RankingTrimestralMesRow[]>;
}
