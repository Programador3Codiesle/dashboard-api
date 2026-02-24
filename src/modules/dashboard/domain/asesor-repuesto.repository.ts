import type { ComisionRepRow } from './dashboard.repository';

/**
 * Contrato de repositorio específico para el dashboard de Asesores de Repuestos.
 * Contiene las consultas de comisiones y ventas por sede/asesor.
 */
export abstract class IAsesorRepuestoDashboardRepository {
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

