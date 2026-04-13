/**
 * Contrato de repositorio para el dashboard de Agente de Contact Center.
 */
export abstract class IAgenteCCDashboardRepository {
  abstract getEstadoAgente(
    nitUsuario: number,
  ): Promise<Array<{ estado: string }>>;
}
