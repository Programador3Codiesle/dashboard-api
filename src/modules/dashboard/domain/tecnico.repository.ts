import type {
  VentasTecRow,
  NpsSedesMesRow,
  RankingRow,
  VentasTecRankingRow,
  NpsTecnicoMesRow,
} from './dashboard.repository';

/**
 * Contrato de repositorio específico para el dashboard de Técnicos.
 * Agrupa solo las consultas relacionadas con técnicos.
 */
export abstract class ITecnicoDashboardRepository {
  abstract getVentasTec(
    nit: number,
    mes: number,
    ano: number,
  ): Promise<VentasTecRow | null>;

  abstract getNpsByTecBuscar(
    nit: number,
    mes: number,
    ano: number,
  ): Promise<NpsSedesMesRow[]>;

  abstract getDataNpsByTec(nit: number): Promise<NpsSedesMesRow[]>;

  abstract getRankingVentas(sedesIds: string): Promise<RankingRow[]>;

  abstract getRankingNps(sedesIds: string): Promise<RankingRow[]>;

  abstract getVentasTecRanking(
    sedesIds: string,
    mes: number,
    ano: number,
  ): Promise<VentasTecRankingRow[]>;

  abstract getNpsByTecGmGraf(
    nit: number,
    mes: number,
    ano: number,
  ): Promise<NpsTecnicoMesRow[]>;
}

