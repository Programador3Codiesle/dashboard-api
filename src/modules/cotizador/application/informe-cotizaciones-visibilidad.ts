import {
  AlcanceInformeCotizaciones,
  InformeCotizacionesVisibilidad,
} from '../domain/informe-cotizaciones-visibilidad';

/** Cotizador.php paintTableInfoCotizacion: 1, 20, 54 ven todas. */
const PERFILES_INFORME_LIVIANOS_TODAS = [1, 20, 54] as const;
/** Cotizador.php: 4, 33, 34, 56, 57, 24 filtran por sedes del usuario. */
const PERFILES_INFORME_LIVIANOS_BODEGA = [4, 33, 34, 56, 57, 24] as const;

/** CotizadorPesados.php informeCotizacionPesados: 1, 20 ven todas. */
const PERFILES_INFORME_PESADOS_TODAS = [1, 20] as const;
/** CotizadorPesados.php: 33, 34, 56, 57, 24 filtran por sedes. */
const PERFILES_INFORME_PESADOS_BODEGA = [33, 34, 56, 57, 24] as const;

function incluyePerfil(lista: readonly number[], perfilId: number): boolean {
  return lista.includes(perfilId);
}

/**
 * Perfiles 30 (coordinador CC) y 31 (agente CC) caen en `propias`
 * (`WHERE usuario = nit` de sesión).
 */
export function alcanceInformeLivianos(
  perfilId: number,
): AlcanceInformeCotizaciones {
  if (incluyePerfil(PERFILES_INFORME_LIVIANOS_TODAS, perfilId)) {
    return 'todas';
  }
  if (incluyePerfil(PERFILES_INFORME_LIVIANOS_BODEGA, perfilId)) {
    return 'bodega';
  }
  return 'propias';
}

export function alcanceInformePesados(
  perfilId: number,
): AlcanceInformeCotizaciones {
  if (incluyePerfil(PERFILES_INFORME_PESADOS_TODAS, perfilId)) {
    return 'todas';
  }
  if (incluyePerfil(PERFILES_INFORME_PESADOS_BODEGA, perfilId)) {
    return 'bodega';
  }
  return 'propias';
}

export async function visibilidadDesdeAlcance(
  alcance: AlcanceInformeCotizaciones,
  nitUsuario: number,
  getSedesUsuarioByNit: (nit: number) => Promise<number[]>,
): Promise<InformeCotizacionesVisibilidad> {
  if (alcance === 'todas') {
    return { tipo: 'todas' };
  }
  if (alcance === 'bodega') {
    const bodegaIds = await getSedesUsuarioByNit(nitUsuario);
    return { tipo: 'bodega', bodegaIds };
  }
  return { tipo: 'propias', nitUsuario };
}
