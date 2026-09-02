import { BadRequestException, Injectable } from '@nestjs/common';
import { IAuditoriaRepository } from '../../domain/auditoria.repository';

const SEDES_TEC = ['giron', 'rosita', 'barranca', 'bocono'] as const;

@Injectable()
export class NpsFabricaTecnicosUseCase {
  constructor(private readonly repo: IAuditoriaRepository) {}

  async execute(fecha: string, sede?: string) {
    const [year, month] = (fecha || '').split('-').map(Number);
    if (!year || !month) {
      throw new BadRequestException('fecha YYYY-MM requerida');
    }

    const sedes = sede ? SEDES_TEC.filter((s) => s === sede) : [...SEDES_TEC];

    if (sede && sedes.length === 0) {
      throw new BadRequestException('Sede inválida');
    }

    const partes = await Promise.all(
      sedes.map(async (s) => {
        const [agregado, detalle] = await Promise.all([
          this.repo.npsTecnicoAgregado(s, year, month),
          this.repo.npsTecnicoDetalle(s, year, month),
        ]);
        return { sede: s, agregado, detalle };
      }),
    );

    const result: Record<
      string,
      {
        agregado: { enc06: number; enc78: number; enc910: number };
        detalle: Awaited<ReturnType<IAuditoriaRepository['npsTecnicoDetalle']>>;
      }
    > = {};
    for (const p of partes) {
      result[p.sede] = { agregado: p.agregado, detalle: p.detalle };
    }
    return result;
  }
}
