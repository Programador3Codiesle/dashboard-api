/**
 * Contrato de repositorio para el dashboard de Mantenimiento (perfil 46).
 * Mantenimiento_uno.php: s_pendientes / s_proceso / s_finalizadas / *Pre.
 */
export abstract class IMantenimientoDashboardRepository {
  abstract sPendientes(sedeIds: number[]): Promise<number>;
  abstract sProceso(sedeIds: number[]): Promise<number>;
  abstract sFinalizadas(sedeIds: number[]): Promise<number>;
  abstract sPendientesPre(fechaActual: string): Promise<number>;
  abstract sProcesoPre(fechaActual: string): Promise<number>;
  abstract sFinalizadasPre(fechaActual: string): Promise<number>;
}
