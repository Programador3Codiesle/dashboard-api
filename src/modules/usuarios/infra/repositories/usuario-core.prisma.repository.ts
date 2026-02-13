/**
 * Repositorio de Usuario - Operaciones Core (CRUD básico)
 * Implementa IUsuarioCoreRepository siguiendo Clean Architecture
 */
import { Injectable } from "@nestjs/common";
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import { UsuarioMapper } from "../../presentation/mappers/usuario.mapper";
import { PerfilesEntity, UsuarioEntity } from "../../domain/usuario.entity";
import { IUsuarioCoreRepository } from "../../domain/repositories/usuario-core.repository";

@Injectable()
export class UsuarioCoreRepository implements IUsuarioCoreRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Listar todos los usuarios con paginación
   */
  async findAll(page: number = 1, limit: number = 1000) {
    const offset = (page - 1) * limit;

    const results = await this.prisma.$queryRaw<any[]>`
      SELECT
        ps.id_empleado,
        u.id_usuario,
        p.nom_perfil,
        t.nombres,
        u.usuario,
        CAST(u.nit_usuario AS VARCHAR(20)) AS nit,
        CASE 
          WHEN u.estado = 1 THEN 'ACTIVO'
          ELSE 'INACTIVO'
        END as estado,
        h.sede,
        u.fecha_hora_crea_usu,
        u.fecha_hora_mod_usu,
        STUFF((
          SELECT ', ' + CAST(em2.idEmpresa AS VARCHAR(10))
          FROM sw_empresa_usuario em2
          WHERE em2.idUsuario = u.nit_usuario
          FOR XML PATH(''), TYPE
        ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS idEmpresas  
      FROM w_sist_usuarios u
      INNER JOIN terceros t ON t.nit = u.nit_usuario
      LEFT JOIN postv_horarios_empleados h ON CAST(h.nit_empleado AS DECIMAL(18,0)) = u.nit_usuario
      LEFT JOIN postv_empleados ps ON ps.nit_empleado=u.nit_usuario
      INNER JOIN postv_perfiles p ON p.id_perfil = u.perfil_postventa
      GROUP BY
        u.id_usuario,
        ps.id_empleado,
        p.nom_perfil,
        t.nombres,
        u.usuario,
        u.nit_usuario,
        u.estado,
        h.sede,
        u.fecha_hora_crea_usu,
        u.fecha_hora_mod_usu
      ORDER BY u.id_usuario DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
    `;

    return results.map(UsuarioMapper.mapUsuariosBD);
  }

  /**
   * Actualizar datos de un usuario
   */
  async updateUsuario(idUsuario: number, dto: any): Promise<PerfilesEntity> {
    await this.prisma.w_sist_usuarios.update({
      where: { id_usuario: idUsuario },
      data: dto,
    });

    const usuarioData = await this.prisma.$queryRaw<Array<{ id_perfil: number, nom_perfil: string }>>`
      SELECT * FROM postv_perfiles where id_perfil=${dto.perfil_postventa};
    `;

    return new PerfilesEntity({
      id: usuarioData[0].id_perfil.toString(),
      nombre: usuarioData[0].nom_perfil,
    });
  }

  /**
   * Eliminar un usuario
   */
  async delete(id: number) {
    await this.prisma.w_sist_usuarios.delete({ where: { id_usuario: id } });
  }

  /**
   * Listar todos los perfiles disponibles
   */
  async listarPerfiles(): Promise<PerfilesEntity[]> {
    const perfilesData = await this.prisma.$queryRaw<Array<{ id_perfil: number, nom_perfil: string }>>`
      SELECT id_perfil , nom_perfil
      FROM postv_perfiles
    `;
    return perfilesData.map((item) => new PerfilesEntity({ 
      id: item.id_perfil.toString(), 
      nombre: item.nom_perfil 
    }));
  }

  /**
   * Obtener el perfil de un usuario específico
   */
  async listarPerfilUsuario(id: number): Promise<PerfilesEntity[]> {
    const perfilData = await this.prisma.$queryRaw<Array<{ id_perfil: bigint, nom_perfil: string }>>`
      SELECT 
        w.perfil_postventa AS id_perfil,
        pv.nom_perfil 
      FROM w_sist_usuarios w
      LEFT JOIN postv_perfiles pv ON pv.id_perfil = w.perfil_postventa
      WHERE w.nit_usuario = ${id}
    `;

    return perfilData.map((item) => {
      const perfilId = typeof item.id_perfil === 'bigint'
        ? item.id_perfil.toString()
        : item.id_perfil;

      return new PerfilesEntity({
        id: perfilId,
        nombre: item.nom_perfil
      });
    });
  }

  /**
   * Resetear la contraseña de un usuario
   */
  async resetPassword(id: number, encryptedPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.prisma.w_sist_usuarios.update({
        where: { id_usuario: id },
        data: {
          pass: encryptedPassword,
          num_intentos: 0,
          estado_usuario: 1
        }
      });
      return {
        success: true,
        message: 'Contraseña actualizada correctamente'
      };
    } catch (error: any) {
      console.error('Error resetting password:', error);
      return {
        success: false,
        message: 'Error al actualizar la contraseña: ' + error.message
      };
    }
  }

  /**
   * Deshabilitar un usuario
   */
  async deshabilitar(id: number): Promise<{ success: boolean; message: string }> {
    try {
      await this.prisma.w_sist_usuarios.update({
        where: { id_usuario: id },
        data: { estado: 0 }
      });
      return {
        success: true,
        message: 'Usuario deshabilitado correctamente'
      };
    } catch (error: any) {
      console.error('Error deshabilitando usuario:', error);
      return {
        success: false,
        message: 'Error al deshabilitar el usuario: ' + error.message
      };
    }
  }

  /**
   * Habilitar un usuario
   */
  async habilitar(id: number): Promise<{ success: boolean; message: string }> {
    try {
      await this.prisma.w_sist_usuarios.update({
        where: { id_usuario: id },
        data: { estado: 1 }
      });
      return {
        success: true,
        message: 'Usuario habilitado correctamente'
      };
    } catch (error: any) {
      console.error('Error habilitando usuario:', error);
      return {
        success: false,
        message: 'Error al habilitar el usuario: ' + error.message
      };
    }
  }

  /**
   * Listar usuarios que pueden ser jefes
   */
  async verUsuariosJefes(): Promise<UsuarioEntity[]> {
    const rawData: any[] = await this.prisma.$queryRaw`
      SELECT u.id_usuario, p.nom_perfil, t.nombres, u.usuario, t.nit, u.estado 
      FROM w_sist_usuarios u 
      INNER JOIN terceros t ON t.nit = u.nit_usuario 
      LEFT JOIN postv_perfiles p ON p.id_perfil = u.perfil_postventa
      WHERE u.estado = 1
    `;

    return rawData.map((row) => new UsuarioEntity({
      id: row.nit.toString(),
      nombre: row.nombres
    }));
  }

  /**
   * Obtener el id_empleado desde postv_empleados a partir del NIT del empleado.
   */
  async obtenerIdEmpleadoPorNit(nit: number): Promise<number | null> {
    const rows = await this.prisma.$queryRaw<{ id_empleado: number | null }[]>`
      SELECT TOP 1 id_empleado
      FROM postv_empleados
      WHERE nit_empleado = ${nit}
    `;

    if (!rows.length || rows[0].id_empleado == null) {
      return null;
    }

    return Number(rows[0].id_empleado);
  }

  /**
   * Verificar si existe un usuario por NIT
   */
  async verUsuarioPorNit(nit: string): Promise<boolean> {
    const usuarioData = await this.prisma.$queryRaw<{ nit_usuario: string }[]>`
      SELECT nit_usuario
      FROM w_sist_usuarios
      WHERE nit_usuario = ${nit}
    `;
    return usuarioData.length > 0;
  }

  /**
   * Verificar si existe un tercero por NIT
   */
  async verTercero(nit: string): Promise<boolean> {
    const terceroData = await this.prisma.$queryRaw<{ nit: string }[]>`
      SELECT nit
      FROM terceros
      WHERE nit = ${nit}
    `;
    return terceroData.length > 0;
  }

  /**
   * Crear un nuevo usuario
   */
  async crearUsuario(data: any): Promise<{ success: boolean; message: string }> {
    try {
      await this.prisma.$executeRaw`
        INSERT INTO w_sist_usuarios (nit_usuario,estado,pass,num_intentos,perfil_postventa,clave,tipo_tercero,fid_perfil)
        VALUES (${data.nit}, ${data.estado}, ${data.encryptedPassword}, ${data.num_intentos}, ${data.perfil}, ${data.clave}, ${data.tipo_tercero}, ${data.fid_perfil})
      `;

      return {
        success: true,
        message: 'Usuario creado correctamente'
      };
    } catch (error: any) {
      console.error('Error creando usuario:', error);
      return {
        success: false,
        message: 'Error al crear el usuario: ' + error.message
      };
    }
  }

  /**
   * Ejecutar una transacción
   */
  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }
}
