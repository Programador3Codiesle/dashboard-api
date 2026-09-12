/** Administracion.php listado_ausentismo / listadodiahorasextras */
export function sedePorteriaByPerfil(perfil: unknown): string {
  const n = Number(perfil);
  if (n === 7 || n === 20) return 'Giron';
  if (n === 45) return 'Bocono';
  return '';
}

/** listarHorasExtras / filtroHorasExtras: GH ve todas. */
export const NIT_GESTION_HUMANA_HE = 63369607;
export const PERFIL_GESTION_HUMANA = 20;

export function veTodasLasHorasExtras(nit: unknown, perfil: unknown): boolean {
  return (
    Number(nit) === NIT_GESTION_HUMANA_HE ||
    Number(perfil) === PERFIL_GESTION_HUMANA
  );
}
