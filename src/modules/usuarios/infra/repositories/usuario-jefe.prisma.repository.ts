/**
 * Repositorio de Usuario - Gestión de Jefes
 * Implementa IUsuarioJefeRepository siguiendo Clean Architecture
 */
import { Injectable } from "@nestjs/common";
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import { JefesEntity } from "../../domain/usuario.entity";
import { CreateJefeDto } from "../../application/dto/assign-jefe.dto";
import { IUsuarioJefeRepository } from "../../domain/repositories/usuario-jefe.repository";

@Injectable()
export class UsuarioJefeRepository implements IUsuarioJefeRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Asignar un jefe a un empleado
   */
  async assignJefe(id: number, jefeId: number): Promise<JefesEntity> {
    // Insertar la relación jefe-empleado
    await this.prisma.$executeRaw`
      INSERT INTO postv_empleado_jefe (jefe, empleado)
      VALUES (${jefeId}, ${id})
    `;

    // Obtener los datos del jefe para retornarlos
    const jefeData = await this.prisma.$queryRaw<Array<{ id_jefe: number, nombres: string }>>`
      SELECT j.id_jefe, t.nombres
      FROM postv_jefes j
      LEFT JOIN terceros t ON j.nit_jefe = t.nit
      WHERE j.id_jefe = ${jefeId}
    `;

    return new JefesEntity({
      id: jefeData[0].id_jefe.toString(),
      nombre: jefeData[0].nombres,
    });
  }

  /**
   * Ver los jefes asignados a un empleado
   */
  async verJefes(id: number): Promise<JefesEntity[]> {
    const results = await this.prisma.$queryRaw<any[]>`
      SELECT jefe, nombres
      FROM postv_empleado_jefe ej
      LEFT JOIN postv_jefes j ON j.id_jefe = ej.jefe
      LEFT JOIN terceros t ON j.nit_jefe = t.nit
      WHERE empleado = ${id}
    `;

    return results.map((item) => new JefesEntity({
      id: item.jefe.toString(),
      nombre: item.nombres,
    }));
  }

  /**
   * Ver todos los jefes disponibles
   */
  async verJefesAll(): Promise<JefesEntity[]> {
    const results = await this.prisma.$queryRaw<any[]>`
      SELECT j.id_jefe, t.nombres
      FROM postv_jefes j
      LEFT JOIN terceros t ON j.nit_jefe = t.nit
    `;

    return results.map((item) => new JefesEntity({
      id: item.id_jefe.toString(),
      nombre: item.nombres,
    }));
  }

  /**
   * Eliminar la asignación de un jefe a un empleado
   */
  async eliminarJefe(id: number, jefeId: number): Promise<JefesEntity> {
    // Eliminar la relación jefe-empleado
    await this.prisma.$executeRaw`
      DELETE FROM postv_empleado_jefe
      WHERE empleado = ${id} AND jefe = ${jefeId}
    `;

    // Obtener los datos del jefe para retornarlos
    const jefeData = await this.prisma.$queryRaw<Array<{ id_jefe: number, nombres: string }>>`
      SELECT j.id_jefe, t.nombres
      FROM postv_jefes j
      LEFT JOIN terceros t ON j.nit_jefe = t.nit
      WHERE j.id_jefe = ${jefeId}
    `;

    return new JefesEntity({
      id: jefeData[0].id_jefe.toString(),
      nombre: jefeData[0].nombres,
    });
  }

  /**
   * Ver todos los jefes con información completa
   */
  async verJefesAllGeneral(): Promise<JefesEntity[]> {
    const rawData: any[] = await this.prisma.$queryRaw`
      SELECT j.id_jefe, j.nit_jefe, t.nombres, correo 
      FROM postv_jefes j
      INNER JOIN terceros t ON j.nit_jefe = t.nit
      ORDER BY id_jefe DESC
    `;

    return rawData.map((row) => new JefesEntity({
      id: row.id_jefe.toString(),
      nit: row.nit_jefe.toString(),
      nombre: row.nombres,
      email: row.correo
    }));
  }

  /**
   * Crear un nuevo jefe
   */
  async crearJefe(dto: CreateJefeDto): Promise<{ success: boolean; message: string }> {
    console.log('data jefe', dto);
    try {
      await this.prisma.$executeRaw`
        INSERT INTO postv_jefes (nit_jefe, correo) VALUES (${dto.nit}, ${dto.email})
      `;

      return {
        success: true,
        message: 'Jefe creado correctamente'
      };
    } catch (error: any) {
      console.error('Error creando jefe:', error);
      return {
        success: false,
        message: 'Error al crear el jefe: ' + error.message
      };
    }
  }
}
