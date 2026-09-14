/**
 * Tickets.php index(): `$area` según NIT de sesión.
 * Staff filtra Finalizados con `tk.area`. Activos no filtran área.
 * 1095944273 (Cristhian) sustituye a Andrés Gómez en sistemas.
 */
const AREA_POR_NIT: Record<number, string> = {
  1102368016: 'sistemas',
  1098625558: 'sistemas',
  1110602826: 'sistemas',
  1096219894: 'sistemas',
  1097304901: 'sistemas',
  1095944273: 'sistemas',
  63369607: 'nomina',
  1095816030: 'gestion humana',
  63344288: 'tesoreria',
  27882542: 'salud ocupacional',
  63552277: 'contabilidad',
  1128465895: 'compras',
  63308540: 'asistente de gerencia',
};

export const AREA_TICKETS_DEFAULT = 'otro';

export function areaTicketsPorNit(nit: unknown): string {
  const n = Number(nit);
  if (!Number.isFinite(n)) return AREA_TICKETS_DEFAULT;
  return AREA_POR_NIT[n] ?? AREA_TICKETS_DEFAULT;
}
