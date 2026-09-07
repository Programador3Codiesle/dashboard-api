export const DEFAULT_LIST_LIMIT = 100;
export const MAX_LIST_LIMIT = 100;
export const ESTADO_TALLER_DEFAULT_LIMIT = 200;
export const ESTADO_TALLER_MAX_LIMIT = 200;

export type PageSlice = {
  pagina: number;
  limite: number;
  offset: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  pagina: number;
  limite: number;
};

function toPositiveInt(value: number | undefined, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  const n = Math.floor(value);
  return n > 0 ? n : fallback;
}

export function clampPageLimit(
  pagina: number | undefined,
  limite: number | undefined,
  defaultLimit = DEFAULT_LIST_LIMIT,
  maxLimit = MAX_LIST_LIMIT,
): PageSlice {
  const page = toPositiveInt(pagina, 1);
  const cappedMax = Math.max(1, maxLimit);
  const rawLimit = toPositiveInt(limite, defaultLimit);
  const limit = Math.min(rawLimit, cappedMax);
  return {
    pagina: page,
    limite: limit,
    offset: (page - 1) * limit,
  };
}
