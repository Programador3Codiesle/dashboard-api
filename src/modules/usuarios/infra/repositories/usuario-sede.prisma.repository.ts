/**
 * Repositorio de Usuario - Gestión de Sedes
 * Implementa IUsuarioSedeRepository siguiendo Clean Architecture
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import { SedesEntity } from '../../domain/usuario.entity';
import { IUsuarioSedeRepository } from '../../domain/repositories/usuario-sede.repository';

@Injectable()
export class UsuarioSedeRepository implements IUsuarioSedeRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ver todas las sedes disponibles
   */
  async verSedes(): Promise<SedesEntity[]> {
    const results = await this.prisma.$queryRaw<any[]>`
      SELECT bodega, descripcion
      FROM bodegas
      ORDER BY bodega
    `;

    return results.map(
      (item) =>
        new SedesEntity({
          id: item.bodega.toString(),
          nombre: item.descripcion,
        }),
    );
  }

  /**
   * Ver las sedes asignadas a un usuario
   */
  async verSedeUsuario(id: number): Promise<SedesEntity[]> {
    const results = await this.prisma.$queryRaw<any[]>`
      SELECT idsede
      FROM sw_usuariosede
      WHERE idusuario = ${id} AND idsede IS NOT NULL
    `;

    return results.map(
      (item) =>
        new SedesEntity({
          id: item.idsede?.toString() || '',
        }),
    );
  }

  /**
   * Asignar una sede a un usuario
   */
  async asignarSede(idUsuario: number, idSede: number): Promise<SedesEntity> {
    // Insertar la relación usuario-sede
    await this.prisma.$executeRaw`
      INSERT INTO sw_usuariosede (idusuario, idsede)
      VALUES (${idUsuario}, ${idSede})
    `;

    // Obtener los datos de la sede directamente desde bodegas
    const sedeData = await this.prisma.$queryRaw<
      Array<{ bodega: number; descripcion: string }>
    >`
      SELECT bodega, descripcion
      FROM bodegas
      WHERE id = ${idSede}
    `;

    // Validar que se encontró la sede
    if (!sedeData || sedeData.length === 0) {
      throw new NotFoundException(`Sede con ID ${idSede} no encontrada`);
    }

    return new SedesEntity({
      id: sedeData[0].bodega.toString(),
      nombre: sedeData[0].descripcion,
    });
  }

  /**
   * Eliminar la asignación de una sede a un usuario
   */
  async eliminarSede(idUsuario: number, idSede: number): Promise<SedesEntity> {
    // Eliminar la relación usuario-sede
    await this.prisma.$executeRaw`
      DELETE FROM sw_usuariosede
      WHERE idusuario = ${idUsuario} AND idsede = ${idSede}
    `;

    // Obtener los datos de la sede directamente desde bodegas
    const sedeData = await this.prisma.$queryRaw<
      Array<{ bodega: number; descripcion: string }>
    >`
      SELECT bodega, descripcion
      FROM bodegas
      WHERE id = ${idSede}
    `;

    // Validar que se encontró la sede
    if (!sedeData || sedeData.length === 0) {
      throw new NotFoundException(`Sede con ID ${idSede} no encontrada`);
    }

    return new SedesEntity({
      id: sedeData[0].bodega.toString(),
      nombre: sedeData[0].descripcion,
    });
  }
}
