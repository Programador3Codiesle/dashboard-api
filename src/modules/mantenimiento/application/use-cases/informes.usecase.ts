import { BadRequestException, Injectable } from '@nestjs/common';
import { IMantenimientoRepository } from '../../domain/mantenimiento.repository';
import { todayYmd } from '../utils/fechas';

const FECHA_YMD = /^\d{4}-\d{2}-\d{2}$/;

function mesLabel(yyyyMm: string): string {
  const [y, m] = yyyyMm.split('-').map(Number);
  if (!y || !m) return yyyyMm;
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('es-CO', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

@Injectable()
export class InformePreventivoUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  execute(estado?: string, bodega?: string) {
    return this.repo.informePreventivo(
      estado || undefined,
      bodega || undefined,
    );
  }
}

@Injectable()
export class InformeCorrectivoUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  execute(estado?: string, bodega?: string) {
    return this.repo.informeCorrectivo(
      estado || undefined,
      bodega || undefined,
    );
  }
}

@Injectable()
export class InformeEquiposPreventivoUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  async execute(desde?: string, hasta?: string) {
    const hoy = todayYmd();
    const [y, m] = hoy.split('-').map(Number);
    const defaultDesde = `${y}-${String(m).padStart(2, '0')}-01`;
    const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const defaultHasta = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    const from = (desde || defaultDesde).slice(0, 10);
    const to = (hasta || defaultHasta).slice(0, 10);
    if (!FECHA_YMD.test(from) || !FECHA_YMD.test(to)) {
      throw new BadRequestException('Fechas inválidas (use YYYY-MM-DD)');
    }
    if (from > to) {
      throw new BadRequestException(
        'La fecha inicial no puede ser mayor que la final',
      );
    }

    const listado = await this.repo.informeEquiposPreventivo(from, to);
    const counts = new Map<string, number>();
    for (const row of listado) {
      const mes = row.fecha_final.slice(0, 7);
      if (!mes) continue;
      counts.set(mes, (counts.get(mes) ?? 0) + 1);
    }
    const resumen = [...counts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, total]) => ({
        mes,
        label: mesLabel(mes),
        total,
      }));

    return { desde: from, hasta: to, resumen, listado, total: listado.length };
  }
}
