/**
 * Contrato del Repositorio de Usuario - Operaciones Core
 * Define las operaciones CRUD básicas y gestión de perfiles
 */
import { UsuarioEntity, PerfilesEntity } from "../usuario.entity";

export abstract class IUsuarioCoreRepository {
  /**
   * Listar todos los usuarios con paginación
   */
  abstract findAll(page?: number, limit?: number): Promise<UsuarioEntity[]>;

  /**
   * Actualizar datos de un usuario
   */
  abstract updateUsuario(idUsuario: number, dto: any): Promise<PerfilesEntity>;

  /**
   * Eliminar un usuario
   */
  abstract delete(id: number): Promise<void>;

  /**
   * Listar todos los perfiles disponibles
   */
  abstract listarPerfiles(): Promise<PerfilesEntity[]>;

  /**
   * Obtener el perfil de un usuario específico
   */
  abstract listarPerfilUsuario(id: number): Promise<PerfilesEntity[]>;

  /**
   * Resetear la contraseña de un usuario
   */
  abstract resetPassword(id: number, encryptedPassword: string): Promise<{ success: boolean; message: string }>;

  /**
   * Deshabilitar un usuario
   */
  abstract deshabilitar(id: number): Promise<{ success: boolean; message: string }>;

  /**
   * Habilitar un usuario
   */
  abstract habilitar(id: number): Promise<{ success: boolean; message: string }>;

  /**
   * Listar usuarios que pueden ser jefes
   */
  abstract verUsuariosJefes(): Promise<UsuarioEntity[]>;

  /**
   * Verificar si existe un usuario por NIT
   */
  abstract verUsuarioPorNit(nit: string): Promise<boolean>;

  /**
   * Verificar si existe un tercero por NIT
   */
  abstract verTercero(nit: string): Promise<boolean>;

  /**
   * Crear un nuevo usuario
   */
  abstract crearUsuario(data: any): Promise<{ success: boolean; message: string }>;

  /**
   * Ejecutar una transacción
   */
  abstract transaction<T>(fn: () => Promise<T>): Promise<T>;
}
