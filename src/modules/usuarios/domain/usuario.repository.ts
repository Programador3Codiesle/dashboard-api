/**
 * Re-exportación de contratos de repositorios especializados
 *
 * Este archivo mantiene compatibilidad hacia atrás.
 * Se recomienda importar directamente desde ./repositories/
 *
 * @see ./repositories/index.ts para los contratos especializados
 */

// Re-exportar todos los contratos especializados
export * from './repositories';

/**
 * @deprecated Usar las interfaces especializadas en su lugar:
 * - IUsuarioCoreRepository
 * - IUsuarioEmpresaRepository
 * - IUsuarioJefeRepository
 * - IUsuarioSedeRepository
 * - IUsuarioHorarioRepository
 */
export abstract class IUsuarioRepository {
  // Este contrato está deprecado.
  // Los métodos han sido distribuidos en interfaces especializadas.
  // Ver ./repositories/ para los nuevos contratos.
}
