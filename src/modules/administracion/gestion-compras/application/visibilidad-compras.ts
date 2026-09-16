/** Compras.php get_solicitudes: perfiles 1, 20 y 28 ven todas; el resto solo las propias. */
export const PERFILES_COMPRAS_TODAS = [1, 20, 28] as const;

export type SesionListarCompras = {
  nit: number;
  perfil: number;
  empresaId: number;
};

export function veTodasLasCompras(perfil: number): boolean {
  return (PERFILES_COMPRAS_TODAS as readonly number[]).includes(perfil);
}
