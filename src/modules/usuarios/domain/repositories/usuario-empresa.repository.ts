/**
 * Contrato del Repositorio de Usuario - Gestión de Empresas
 * Define las operaciones de asignación y gestión de empresas por usuario
 */
import { AssignEmpresaDto } from '../../application/dto/assign-empresa.dto';

export abstract class IUsuarioEmpresaRepository {
  /**
   * Obtener las empresas asignadas a un usuario
   */
  abstract findEmpresasByUsuario(
    cedula: string,
  ): Promise<{ id_empresa: number }[]>;

  /**
   * Agregar empresas a un usuario de forma segura (batch)
   */
  abstract addEmpresasSafe(
    cedula: string,
    empresasIds: string[],
  ): Promise<string[]>;

  /**
   * Verificar si existe una empresa
   */
  abstract existsEmpresa(id: string): Promise<boolean>;

  /**
   * Eliminar empresas de un usuario
   */
  abstract eliminarEmpresa(
    idUsuario: number,
    dto: AssignEmpresaDto,
  ): Promise<{ success: boolean; message: string }>;
}
