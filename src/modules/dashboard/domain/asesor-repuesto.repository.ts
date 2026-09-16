import type { ComisionRepRow } from './dashboard.repository';

export type PresupuestoTablaSedeRow = { sede: string; presupuesto: number };

/**
 * Contrato de repositorio específico para el dashboard de Asesores de Repuestos.
 * Contiene las consultas de comisiones y ventas por sede/asesor.
 */
export abstract class IAsesorRepuestoDashboardRepository {
  /** Informe::getPresupuesto_sede — tabla `presupuesto` (no postv_presupuesto_posventa). */
  abstract getPresupuestoTablaSede(
    ano: number,
    mes: number,
    idsede: number,
  ): Promise<PresupuestoTablaSedeRow[]>;

  /** Usuarios::getUserByNit — `terceros.nit` (no nit_real). */
  abstract getNombresByNit(nitUsuario: number): Promise<string | null>;

  abstract getComisionRepMostrador(
    nombre: string,
    mes: number,
    ano: number,
  ): Promise<ComisionRepRow | null>;

  abstract getComisionRepMostradorLuisE(
    nombre: string,
    mes: number,
    ano: number,
  ): Promise<ComisionRepRow | null>;

  abstract getComisionRepTaller(
    usuarioCode: string,
    mes: number,
    ano: number,
  ): Promise<ComisionRepRow | null>;

  abstract getComisionRepMostradorSinMayor(
    nombre: string,
    mes: number,
    ano: number,
  ): Promise<ComisionRepRow | null>;

  abstract getComisionRepMostradosMayor(
    nombre: string,
    mes: number,
    ano: number,
  ): Promise<ComisionRepRow | null>;

  abstract getComisionRepMostradosAceite(
    nombre: string,
    mes: number,
    ano: number,
  ): Promise<ComisionRepRow | null>;

  abstract getVentaRepBySede(
    idsede: number,
    mes: number,
    ano: number,
    nombreVendedor: string,
  ): Promise<ComisionRepRow | null>;
}
