/** Bodegas Cúcuta (legacy EntradasVarias) */
export const BODEGAS_CUCUTA = [8, 14, 16, 22] as const;

/** Bodegas resto (legacy EntradasVarias) */
export const BODEGAS_ALL = [1, 6, 7, 11, 9, 21, 19] as const;

/** Usuarios con visión global parcial por bodega */
export const USER_GALVIS = 35;
export const USER_FERRER = 182;

/** Usuarios encargados de bodega */
export const USER_WILSON_FIALLO = 448;
export const USER_JOSE_OLAYA = 109;
export const USER_DIEGO_QUINONEZ = 497;
export const USER_BRAYAN_GARCIA = 449;
export const USER_EXTRA_GIRON = 467;

export type EvListadoScope = {
  soloPropias?: boolean;
  bodegasIn?: number[];
};

/** Alcance de listado solicitudes/informe (legacy load_solicitudes / load_informe) */
export function resolverAlcanceListadoEv(
  userId: number,
  perfil: number,
  modoInforme = false,
): EvListadoScope {
  const perfilesGlobales = modoInforme
    ? [1, 55, 61, 54]
    : [1, 20, 54, 55, 61, 47];

  const usuariosGlobales = [448, 109, 497, 449];

  if (usuariosGlobales.includes(userId) || perfilesGlobales.includes(perfil)) {
    return {};
  }

  if (userId !== USER_GALVIS && userId !== USER_FERRER) {
    return { soloPropias: true };
  }

  if (userId === USER_GALVIS) {
    return { bodegasIn: [...BODEGAS_ALL] };
  }

  return { bodegasIn: [...BODEGAS_CUCUTA] };
}

export function puedeAutorizarEv(userId: number, perfil: number): boolean {
  return (
    [1, 20, 54].includes(perfil) ||
    userId === USER_GALVIS ||
    userId === USER_FERRER
  );
}

export function puedeGestionarEvSv(perfil: number): boolean {
  return perfil === 55 || perfil === 20;
}

export function puedeGestionarSolicitudPendiente(
  userId: number,
  perfil: number,
): boolean {
  return (
    [1, 20, 55, 54, 61].includes(perfil) ||
    userId === USER_GALVIS ||
    userId === USER_FERRER
  );
}

export function puedeMarcarEntregado(
  userId: number,
  perfil: number,
  bodega: number,
): boolean {
  if (perfil === 20) return true;

  switch (bodega) {
    case 1:
    case 11:
    case 9:
    case 21:
      return userId === USER_WILSON_FIALLO || userId === USER_EXTRA_GIRON;
    case 6:
    case 19:
      return userId === USER_JOSE_OLAYA;
    case 7:
      return userId === USER_DIEGO_QUINONEZ;
    case 8:
    case 16:
    case 14:
    case 22:
      return userId === USER_BRAYAN_GARCIA;
    default:
      return false;
  }
}

export function puedeAutorizarOrdenCompra(perfil: number): boolean {
  return perfil === 1 || perfil === 20;
}
