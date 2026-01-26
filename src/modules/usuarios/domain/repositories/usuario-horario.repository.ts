/**
 * Contrato del Repositorio de Usuario - Gestión de Horarios
 * Define las operaciones de asignación y gestión de horarios laborales
 */
import { HorarioEntity } from "../usuario.entity";
import { AssignHorarioDto } from "../../application/dto/assign-horario.dto";

export abstract class IUsuarioHorarioRepository {
  /**
   * Ver el horario de un usuario
   */
  abstract verHorario(idUsuario: number): Promise<HorarioEntity>;

  /**
   * Asignar un horario a un usuario
   */
  abstract assignHorario(idUsuario: number, dto: AssignHorarioDto): Promise<HorarioEntity>;

  /**
   * Actualizar el horario de un usuario
   */
  abstract updateHorario(idUsuario: number, dto: AssignHorarioDto): Promise<HorarioEntity>;
}
