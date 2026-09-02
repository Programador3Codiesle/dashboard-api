import type {
  DatosHidraulicos,
  DatosTecnicos,
  EquipoHojaVidaPayload,
} from '../../domain/mantenimiento.repository';

function parseJsonArray(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((x) => String(x));
  if (typeof raw !== 'string' || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map((x) => String(x)) : [];
  } catch {
    return [];
  }
}

function parseJsonObject<T extends Record<string, unknown>>(
  raw: unknown,
): T | null {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw as T;
  if (typeof raw !== 'string' || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Parsea campos de hoja de vida enviados por multipart FormData. */
export function parseHojaVidaBody(
  body: Record<string, string>,
): EquipoHojaVidaPayload {
  const tieneTecnicos =
    body.tiene_tecnicos === '1' ||
    body.tiene_tecnicos === 'true' ||
    body.tiene_tecnicos === 'on';
  const tieneHidraulicos =
    body.tiene_hidraulicos === '1' ||
    body.tiene_hidraulicos === 'true' ||
    body.tiene_hidraulicos === 'on';
  const tecRaw = parseJsonObject<DatosTecnicos>(body.tecnicos);
  const hidRaw = parseJsonObject<DatosHidraulicos>(body.hidraulicos);
  return {
    alias: body.aliasEquipo || body.alias_equipo || body.alias || '',
    fabricante: body.fabricante || null,
    modelo: body.modelo || null,
    marca: body.marca || null,
    ubicacion: body.ubicacion || null,
    sector: body.sector || null,
    descripcion: body.descripcion || null,
    periodo_mtto_preventivo: body.periodo_mtto_preventivo || null,
    dist_nombre: body.dist_nombre || null,
    dist_direccion: body.dist_direccion || null,
    dist_telefono: body.dist_telefono || null,
    dist_ciudad: body.dist_ciudad || null,
    dist_departamento: body.dist_departamento || null,
    dist_redes_sociales: body.dist_redes_sociales || null,
    tiene_tecnicos: tieneTecnicos,
    tiene_hidraulicos: tieneHidraulicos,
    tecnicos: tieneTecnicos
      ? {
          alimentacion: tecRaw?.alimentacion ?? body.alimentacion ?? null,
          frecuencia_alimentacion:
            tecRaw?.frecuencia_alimentacion ??
            body.frecuencia_alimentacion ??
            null,
          anio_fabricacion:
            tecRaw?.anio_fabricacion ?? body.anio_fabricacion ?? null,
          numero_serie: tecRaw?.numero_serie ?? body.numero_serie ?? null,
          potencia_consumo:
            tecRaw?.potencia_consumo ?? body.potencia_consumo ?? null,
          peso: tecRaw?.peso ?? body.peso ?? null,
          revolucion: tecRaw?.revolucion ?? body.revolucion ?? null,
        }
      : null,
    hidraulicos: tieneHidraulicos
      ? {
          capacidad_litros:
            hidRaw?.capacidad_litros ?? body.capacidad_litros ?? null,
          capacidad_carga_tn:
            hidRaw?.capacidad_carga_tn ?? body.capacidad_carga_tn ?? null,
          tipo_aceite: hidRaw?.tipo_aceite ?? body.tipo_aceite ?? null,
          capacidad_maxima_carga:
            hidRaw?.capacidad_maxima_carga ??
            body.capacidad_maxima_carga ??
            null,
        }
      : null,
    elementos: parseJsonArray(body.elementos),
    recomendaciones: parseJsonArray(body.recomendaciones),
    mtto_operativo: parseJsonArray(body.mtto_operativo),
  };
}
