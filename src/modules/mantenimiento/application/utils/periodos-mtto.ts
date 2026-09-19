import { BadRequestException } from '@nestjs/common';
import { PERIODOS_MTTO_VALIDOS } from '../../domain/mantenimiento.constants';
import type { PeriodoMttoInput } from '../../domain/mantenimiento.repository';

const FECHA_YMD = /^\d{4}-\d{2}-\d{2}$/;

function asText(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return '';
}

function parsePeriodosRaw(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== 'string' || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Parsea la lista de periodos enviada por FormData JSON. */
export function parsePeriodosMtto(raw: unknown): PeriodoMttoInput[] {
  const out: PeriodoMttoInput[] = [];
  for (const item of parsePeriodosRaw(raw)) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    const rec = item as Record<string, unknown>;
    const periodo = asText(rec.periodo).trim();
    const fecha = asText(rec.fecha_inicio).trim().slice(0, 10);
    const descripcion = asText(rec.descripcion).trim().slice(0, 500);
    if (!periodo) continue;
    const idRaw = rec.id;
    const id = idRaw != null && idRaw !== '' ? Number(idRaw) : undefined;
    out.push({
      id: id != null && Number.isFinite(id) && id > 0 ? id : undefined,
      periodo,
      fecha_inicio: fecha,
      descripcion,
    });
  }
  return out;
}

export function assertPeriodosMtto(items: PeriodoMttoInput[]): void {
  const seen = new Set<string>();
  for (const item of items) {
    if (
      !PERIODOS_MTTO_VALIDOS.includes(
        item.periodo as (typeof PERIODOS_MTTO_VALIDOS)[number],
      )
    ) {
      throw new BadRequestException(
        `Periodo inválido: ${item.periodo}. Use semanal, quincenal, mensual, trimestral, semestral o anual`,
      );
    }
    if (!item.descripcion.trim()) {
      throw new BadRequestException(
        `Descripción requerida para el periodo ${item.periodo}`,
      );
    }
    if (!FECHA_YMD.test(item.fecha_inicio)) {
      throw new BadRequestException(
        `Fecha de inicio requerida (YYYY-MM-DD) para el periodo ${item.periodo}`,
      );
    }
    if (seen.has(item.periodo)) {
      throw new BadRequestException(
        `El periodo ${item.periodo} está duplicado en el equipo`,
      );
    }
    seen.add(item.periodo);
  }
}
