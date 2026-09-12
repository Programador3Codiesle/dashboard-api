import { BadRequestException, Injectable } from '@nestjs/common';
import { IRankingTrimestralRepository } from '../../domain/ranking-trimestral.repository';

const MESES_POR_TRIMESTRE: Record<1 | 2 | 3 | 4, [number, number, number]> = {
  1: [1, 2, 3],
  2: [4, 5, 6],
  3: [7, 8, 9],
  4: [10, 11, 12],
};

export type RankingTrimestralFila = {
  operario: string;
  tecnico: string;
  mes1: number;
  mes2: number;
  mes3: number;
  total: number;
};

@Injectable()
export class ListarRankingTrimestralUseCase {
  constructor(private readonly repo: IRankingTrimestralRepository) {}

  async execute(ano: number, trimestre: 1 | 2 | 3 | 4) {
    if (!MESES_POR_TRIMESTRE[trimestre]) {
      throw new BadRequestException('Trimestre inválido');
    }

    const meses = MESES_POR_TRIMESTRE[trimestre];
    const rows = await this.repo.listar(ano, [...meses]);
    const byOperario = new Map<string, RankingTrimestralFila>();

    for (const row of rows) {
      const key = row.operario || row.tecnico;
      const current = byOperario.get(key) ?? {
        operario: row.operario,
        tecnico: row.tecnico,
        mes1: 0,
        mes2: 0,
        mes3: 0,
        total: 0,
      };

      if (row.mes === meses[0]) current.mes1 = row.sumaTodo;
      else if (row.mes === meses[1]) current.mes2 = row.sumaTodo;
      else if (row.mes === meses[2]) current.mes3 = row.sumaTodo;

      current.total = current.mes1 + current.mes2 + current.mes3;
      if (!current.tecnico && row.tecnico) current.tecnico = row.tecnico;
      byOperario.set(key, current);
    }

    const filas = [...byOperario.values()].sort((a, b) => b.total - a.total);

    return {
      ano,
      trimestre,
      meses,
      filas,
    };
  }
}
