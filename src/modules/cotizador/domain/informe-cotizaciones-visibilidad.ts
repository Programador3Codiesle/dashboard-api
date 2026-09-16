/** Alcance del listado de informes (Cotizador.php / CotizadorPesados.php). */
export type InformeCotizacionesVisibilidad =
  | { tipo: 'todas' }
  | { tipo: 'bodega'; bodegaIds: number[] }
  | { tipo: 'propias'; nitUsuario: number };

export type AlcanceInformeCotizaciones = InformeCotizacionesVisibilidad['tipo'];
