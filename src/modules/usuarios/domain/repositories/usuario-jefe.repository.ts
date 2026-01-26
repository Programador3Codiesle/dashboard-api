/**
 * Contrato del Repositorio de Usuario - Gestión de Jefes
 * Define las operaciones de asignación y gestión de jefes
 */
import { JefesEntity } from "../usuario.entity";
import { CreateJefeDto } from "../../application/dto/assign-jefe.dto";

export abstract class IUsuarioJefeRepository {
  /**
   * Asignar un jefe a un empleado
   */
  abstract assignJefe(id: number, jefeId: number): Promise<JefesEntity>;

  /**
   * Ver los jefes asignados a un empleado
   */
  abstract verJefes(id: number): Promise<JefesEntity[]>;

  /**
   * Ver todos los jefes disponibles
   */
  abstract verJefesAll(): Promise<JefesEntity[]>;

  /**
   * Eliminar la asignación de un jefe a un empleado
   */
  abstract eliminarJefe(id: number, jefeId: number): Promise<JefesEntity>;

  /**
   * Ver todos los jefes con información completa
   */
  abstract verJefesAllGeneral(): Promise<JefesEntity[]>;

  /**
   * Crear un nuevo jefe
   */
  abstract crearJefe(dto: CreateJefeDto): Promise<{ success: boolean; message: string }>;
}
