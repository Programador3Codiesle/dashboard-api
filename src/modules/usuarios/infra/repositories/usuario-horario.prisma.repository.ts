/**
 * Repositorio de Usuario - Gestión de Horarios
 * Implementa IUsuarioHorarioRepository siguiendo Clean Architecture
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import { HorarioEntity } from '../../domain/usuario.entity';
import { AssignHorarioDto } from '../../application/dto/assign-horario.dto';
import { IUsuarioHorarioRepository } from '../../domain/repositories/usuario-horario.repository';

@Injectable()
export class UsuarioHorarioRepository implements IUsuarioHorarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ver el horario de un usuario
   */
  async verHorario(idUsuario: number): Promise<HorarioEntity> {
    const results = await this.prisma.$queryRaw<any[]>`
      SELECT *
      FROM postv_horarios_empleados 
      WHERE nit_empleado = ${idUsuario}
    `;

    // Validar que se encontró un resultado
    if (!results || results.length === 0) {
      throw new NotFoundException(
        `Horario no encontrado para el usuario con ID ${idUsuario}`,
      );
    }

    const item = results[0];

    return new HorarioEntity({
      id: item.nit_empleado.toString(),
      sede: item.sede,
      hora_ent_sem_am: item.hora_ent_sem_am,
      hora_sal_sem_am: item.hora_sal_sem_am,
      hora_ent_sem_pm: item.hora_ent_sem_pm,
      hora_sal_sem_pm: item.hora_sal_sem_pm,
      hora_ent_am_viernes: item.hora_ent_am_viernes,
      hora_sal_am_viernes: item.hora_sal_am_viernes,
      hora_ent_pm_viernes: '',
      hora_sal_pm_viernes: '',
      hora_ent_viernes_pm: item.hora_ent_viernes_pm || '',
      hora_sal_viernes: item.hora_sal_viernes || '',
      hora_ent_fds: item.hora_ent_fds,
      hora_sal_fds: item.hora_sal_fds,
    });
  }

  /**
   * Asignar un horario a un usuario
   */
  async assignHorario(
    idUsuario: number,
    dto: AssignHorarioDto,
  ): Promise<HorarioEntity> {
    // Insertar la relación usuario-horario
    await this.prisma.$executeRaw`
      INSERT INTO postv_horarios_empleados (nit_empleado, sede, hora_ent_sem_am, hora_sal_sem_am, hora_ent_sem_pm, hora_sal_sem_pm, hora_ent_am_viernes, hora_sal_am_viernes, hora_ent_viernes_pm, hora_sal_viernes, hora_ent_fds, hora_sal_fds)
      VALUES (${idUsuario}, ${dto.sede}, ${dto.hora_ent_sem_am}, ${dto.hora_sal_sem_am}, ${dto.hora_ent_sem_pm}, ${dto.hora_sal_sem_pm}, ${dto.hora_ent_am_viernes}, ${dto.hora_sal_am_viernes}, ${dto.hora_ent_viernes_pm}, ${dto.hora_sal_viernes}, ${dto.hora_ent_fds}, ${dto.hora_sal_fds})
    `;

    // Obtener los datos del horario para retornarlos
    const horarioData = await this.prisma.$queryRaw<
      Array<{
        nit_empleado: number;
        sede: string;
        hora_ent_sem_am: string;
        hora_sal_sem_am: string;
        hora_ent_sem_pm: string;
        hora_sal_sem_pm: string;
        hora_ent_am_viernes: string;
        hora_sal_am_viernes: string;
        hora_ent_viernes_pm: string;
        hora_sal_viernes: string;
        hora_ent_fds: string;
        hora_sal_fds: string;
      }>
    >`
      SELECT nit_empleado, sede, hora_ent_sem_am, hora_sal_sem_am, hora_ent_sem_pm, hora_sal_sem_pm, hora_ent_am_viernes, hora_sal_am_viernes, hora_ent_viernes_pm, hora_sal_viernes, hora_ent_fds, hora_sal_fds
      FROM postv_horarios_empleados
      WHERE nit_empleado = ${idUsuario}
    `;

    return this.mapToHorarioEntity(horarioData[0]);
  }

  /**
   * Actualizar el horario de un usuario
   */
  async updateHorario(
    idUsuario: number,
    dto: AssignHorarioDto,
  ): Promise<HorarioEntity> {
    // Actualizar la relación usuario-horario
    await this.prisma.$executeRaw`
      UPDATE postv_horarios_empleados
      SET sede = ${dto.sede}, hora_ent_sem_am = ${dto.hora_ent_sem_am}, hora_sal_sem_am = ${dto.hora_sal_sem_am}, hora_ent_sem_pm = ${dto.hora_ent_sem_pm},
      hora_sal_sem_pm = ${dto.hora_sal_sem_pm}, hora_ent_am_viernes = ${dto.hora_ent_am_viernes}, hora_sal_am_viernes = ${dto.hora_sal_am_viernes},
      hora_ent_viernes_pm = ${dto.hora_ent_viernes_pm}, hora_sal_viernes = ${dto.hora_sal_viernes}, 
      hora_ent_fds = ${dto.hora_ent_fds}, hora_sal_fds = ${dto.hora_sal_fds}
      WHERE nit_empleado = ${idUsuario}
    `;

    // Obtener los datos del horario para retornarlos
    const horarioData = await this.prisma.$queryRaw<
      Array<{
        nit_empleado: number;
        sede: string;
        hora_ent_sem_am: string;
        hora_sal_sem_am: string;
        hora_ent_sem_pm: string;
        hora_sal_sem_pm: string;
        hora_ent_am_viernes: string;
        hora_sal_am_viernes: string;
        hora_ent_viernes_pm: string;
        hora_sal_viernes: string;
        hora_ent_fds: string;
        hora_sal_fds: string;
      }>
    >`
      SELECT nit_empleado, sede, hora_ent_sem_am, hora_sal_sem_am, hora_ent_sem_pm, hora_sal_sem_pm, hora_ent_am_viernes, hora_sal_am_viernes, hora_ent_viernes_pm, hora_sal_viernes, hora_ent_fds, hora_sal_fds
      FROM postv_horarios_empleados
      WHERE nit_empleado = ${idUsuario}
    `;

    return this.mapToHorarioEntity(horarioData[0]);
  }

  /**
   * Mapear datos de BD a entidad de dominio
   */
  private mapToHorarioEntity(data: any): HorarioEntity {
    return new HorarioEntity({
      id: data.nit_empleado.toString(),
      sede: data.sede,
      hora_ent_sem_am: data.hora_ent_sem_am,
      hora_sal_sem_am: data.hora_sal_sem_am,
      hora_ent_sem_pm: data.hora_ent_sem_pm,
      hora_sal_sem_pm: data.hora_sal_sem_pm,
      hora_ent_am_viernes: data.hora_ent_am_viernes,
      hora_sal_am_viernes: data.hora_sal_am_viernes,
      hora_ent_pm_viernes: '', // Campo no existe en BD
      hora_sal_pm_viernes: '', // Campo no existe en BD
      hora_ent_viernes_pm: data.hora_ent_viernes_pm || '',
      hora_sal_viernes: data.hora_sal_viernes || '',
      hora_ent_fds: data.hora_ent_fds,
      hora_sal_fds: data.hora_sal_fds,
    });
  }
}
