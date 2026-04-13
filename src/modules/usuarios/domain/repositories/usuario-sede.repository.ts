/**
 * Contrato del Repositorio de Usuario - Gestión de Sedes
 * Define las operaciones de asignación y gestión de sedes
 */
import { SedesEntity } from '../usuario.entity';

export abstract class IUsuarioSedeRepository {
  /**
   * Ver todas las sedes disponibles
   */
  abstract verSedes(): Promise<SedesEntity[]>;

  /**
   * Ver las sedes asignadas a un usuario
   */
  abstract verSedeUsuario(id: number): Promise<SedesEntity[]>;

  /**
   * Asignar una sede a un usuario
   */
  abstract asignarSede(idUsuario: number, idSede: number): Promise<SedesEntity>;

  /**
   * Eliminar la asignación de una sede a un usuario
   */
  abstract eliminarSede(
    idUsuario: number,
    idSede: number,
  ): Promise<SedesEntity>;
}
