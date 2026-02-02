import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import { UsuarioMapper } from "../../presentation/mappers/usuario.mapper";
import { CreateUsuarioDto } from "../../application/dto/create-usuario.dto";
import { UpdateUsuarioDto } from "../../application/dto/update-usuario.dto";
import { AssignHorarioDto } from "../../application/dto/assign-horario.dto";
import { JefesEntity, SedesEntity, PerfilesEntity, HorarioEntity, UsuarioEntity } from "../../domain/usuario.entity";
import { AssignEmpresaDto } from "../../application/dto/assign-empresa.dto";
import { CreateJefeDto } from "../../application/dto/assign-jefe.dto";
import { log } from "console";

@Injectable()
export class UsuarioRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(page: number = 1, limit: number = 100) {
    // Optimizado: Query con paginación usando OFFSET FETCH (SQL Server)
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


  async updateUsuario(idUsuario: number, dto: any): Promise<PerfilesEntity> {

    const usuario = await this.prisma.w_sist_usuarios.update({
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

  async delete(id: number) {
    await this.prisma.w_sist_usuarios.delete({ where: { id_usuario: id } });
  }

  async findEmpresasByUsuario(cedula: string): Promise<{ id_empresa: number }[]> {
    return this.prisma.$queryRaw`
      SELECT idEmpresa 
      FROM sw_empresa_usuario
      WHERE idUsuario = CAST(${cedula} AS DECIMAL(18,0))
        AND estado = 1
      ORDER BY idEmpresa
    `;
  }

  async addEmpresasSafe(cedula: string, empresasIds: string[]): Promise<string[]> {
    const agregadas: string[] = [];

    if (empresasIds.length === 0) return agregadas;

    // Optimizado: Una sola query batch en lugar de N queries en loop
    await this.prisma.$transaction(async (tx) => {
      try {
        // 1. Obtener todas las empresas existentes en una sola query
        const existentes = await tx.$queryRaw<Array<{ idEmpresa: number }>>`
          SELECT idEmpresa
          FROM sw_empresa_usuario
          WHERE idUsuario = CAST(${cedula} AS DECIMAL(18,0))
            AND idEmpresa IN (${Prisma.join(empresasIds.map(id => parseInt(id)))})
            AND estado = 1
        `;

        const existentesSet = new Set(existentes.map(e => e.idEmpresa));

        // 2. Filtrar solo las que no existen
        const nuevasEmpresas = empresasIds.filter(id => !existentesSet.has(parseInt(id)));

        // 3. Insertar todas las nuevas en batch
        for (const empresaId of nuevasEmpresas) {
          await tx.$executeRaw`
            INSERT INTO sw_empresa_usuario
            (idEmpresa, idUsuario, estado) 
            VALUES (${parseInt(empresaId)}, CAST(${cedula} AS DECIMAL(18,0)), 1)
          `;
          agregadas.push(empresaId);
        }
      } catch (error: any) {
        console.error(`Error al agregar empresas:`, error.message);
      }
    });

    return agregadas;
  }

  async existsEmpresa(id: string): Promise<boolean> {
    const result = await this.prisma.$queryRaw<Array<{ existe: number }>>`
      SELECT CASE 
        WHEN EXISTS (
          SELECT 1 
          FROM sw_empresa
          WHERE id = ${parseInt(id)}
            AND estado = 1
        ) THEN 1 
        ELSE 0 
      END as existe
    `;

    return result[0]?.existe === 1;
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }

  async eliminarEmpresa(idUsuario: number, dto: AssignEmpresaDto): Promise<{ success: boolean; message: string }> {
 
    try {
      if (!dto.empresas || dto.empresas.length === 0) {
        return {
          success: true,
          message: 'No se enviaron empresas para eliminar.'
        };
      }

      const empresasIds = dto.empresas.map(e => Number(e)).filter(n => !isNaN(n));

      if (empresasIds.length === 0) {
        return {
          success: false,
          message: 'Los IDs de empresas proporcionados no son válidos.'
        };
      }

      await this.prisma.$executeRaw`
        DELETE FROM sw_empresa_usuario
        WHERE idUsuario = ${idUsuario} 
        AND idEmpresa IN (${Prisma.join(empresasIds)})
      `;

      return {
        success: true,
        message: 'Empresas eliminadas correctamente'
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Error al eliminar la empresa: ' + error.message
      };
    }
  }


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


  async verJefes(id: number): Promise<JefesEntity[]> {
    // Optimizado: Usar $queryRaw con parámetro seguro
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

  async verJefesAll(): Promise<JefesEntity[]> {
    // Optimizado: Usar $queryRaw (seguro contra SQL injection)
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

  async verSedes(): Promise<SedesEntity[]> {
    // Optimizado: Usar $queryRaw (seguro contra SQL injection)
    const results = await this.prisma.$queryRaw<any[]>`
      SELECT bodega, descripcion
      FROM bodegas
      ORDER BY bodega
    `;

    return results.map((item) => new SedesEntity({
      id: item.bodega.toString(),
      nombre: item.descripcion,
    }));
  }

  async verSedeUsuario(id: number): Promise<SedesEntity[]> {
    // Optimizado: Usar $queryRaw con parámetro seguro
    const results = await this.prisma.$queryRaw<any[]>`
      SELECT idsede
      FROM sw_usuariosede
      WHERE idusuario = ${id} AND idsede IS NOT NULL
    `;

    return results.map((item) => new SedesEntity({
      id: item.idsede?.toString() || ''
    }));
  }

  async asignarSede(idUsuario: number, idSede: number): Promise<SedesEntity> {
    // Insertar la relación usuario-sede
    await this.prisma.$executeRaw`
      INSERT INTO sw_usuariosede (idusuario, idsede)
      VALUES (${idUsuario}, ${idSede})
    `;

    // Obtener los datos de la sede directamente desde bodegas
    const sedeData = await this.prisma.$queryRaw<Array<{ bodega: number, descripcion: string }>>`
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

  async eliminarSede(idUsuario: number, idSede: number): Promise<SedesEntity> {
    // Eliminar la relación usuario-sede
    await this.prisma.$executeRaw`
      DELETE FROM sw_usuariosede
      WHERE idusuario = ${idUsuario} AND idsede = ${idSede}
    `;

    // Obtener los datos de la sede directamente desde bodegas
    const sedeData = await this.prisma.$queryRaw<Array<{ bodega: number, descripcion: string }>>`
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

  async verHorario(idUsuario: number): Promise<HorarioEntity> {

    const results = await this.prisma.$queryRaw<any[]>`
      SELECT *
      FROM postv_horarios_empleados 
      WHERE nit_empleado = ${idUsuario}
    `;

    // Validate that we found a result
    if (!results || results.length === 0) {
      throw new NotFoundException(`Horario no encontrado para el usuario con ID ${idUsuario}`);
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


  async assignHorario(idUsuario: number, dto: AssignHorarioDto): Promise<HorarioEntity> {

    // Insertar la relación usuario-horario
    await this.prisma.$executeRaw`
      INSERT INTO postv_horarios_empleados (nit_empleado, sede, hora_ent_sem_am, hora_sal_sem_am, hora_ent_sem_pm, hora_sal_sem_pm, hora_ent_am_viernes, hora_sal_am_viernes, hora_ent_viernes_pm, hora_sal_viernes, hora_ent_fds, hora_sal_fds)
      VALUES (${idUsuario}, ${dto.sede}, ${dto.hora_ent_sem_am}, ${dto.hora_sal_sem_am}, ${dto.hora_ent_sem_pm}, ${dto.hora_sal_sem_pm}, ${dto.hora_ent_am_viernes}, ${dto.hora_sal_am_viernes}, ${dto.hora_ent_viernes_pm}, ${dto.hora_sal_viernes}, ${dto.hora_ent_fds}, ${dto.hora_sal_fds})
    `;

    // Obtener los datos del horario para retornarlos
    const horarioData = await this.prisma.$queryRaw<Array<{ nit_empleado: number, sede: string, hora_ent_sem_am: string, hora_sal_sem_am: string, hora_ent_sem_pm: string, hora_sal_sem_pm: string, hora_ent_am_viernes: string, hora_sal_am_viernes: string, hora_ent_viernes_pm: string, hora_sal_viernes: string, hora_ent_fds: string, hora_sal_fds: string }>>`
      SELECT nit_empleado, sede, hora_ent_sem_am, hora_sal_sem_am, hora_ent_sem_pm, hora_sal_sem_pm, hora_ent_am_viernes, hora_sal_am_viernes, hora_ent_viernes_pm, hora_sal_viernes, hora_ent_fds, hora_sal_fds
      FROM postv_horarios_empleados
      WHERE nit_empleado = ${idUsuario}
    `;

    return new HorarioEntity({
      id: horarioData[0].nit_empleado.toString(),
      sede: horarioData[0].sede,
      hora_ent_sem_am: horarioData[0].hora_ent_sem_am,
      hora_sal_sem_am: horarioData[0].hora_sal_sem_am,
      hora_ent_sem_pm: horarioData[0].hora_ent_sem_pm,
      hora_sal_sem_pm: horarioData[0].hora_sal_sem_pm,
      hora_ent_am_viernes: horarioData[0].hora_ent_am_viernes,
      hora_sal_am_viernes: horarioData[0].hora_sal_am_viernes,
      hora_ent_pm_viernes: '', // Campo no existe en BD, mantener vacío para compatibilidad
      hora_sal_pm_viernes: '', // Campo no existe en BD, mantener vacío para compatibilidad
      hora_ent_viernes_pm: horarioData[0].hora_ent_viernes_pm || '',
      hora_sal_viernes: horarioData[0].hora_sal_viernes || '',
      hora_ent_fds: horarioData[0].hora_ent_fds,
      hora_sal_fds: horarioData[0].hora_sal_fds,
    });
  }


  async updateHorario(idUsuario: number, dto: AssignHorarioDto): Promise<HorarioEntity> {

    // Insertar la relación usuario-horario
    await this.prisma.$executeRaw`
      UPDATE postv_horarios_empleados
      SET sede = ${dto.sede}, hora_ent_sem_am = ${dto.hora_ent_sem_am}, hora_sal_sem_am = ${dto.hora_sal_sem_am}, hora_ent_sem_pm = ${dto.hora_ent_sem_pm},
      hora_sal_sem_pm = ${dto.hora_sal_sem_pm}, hora_ent_am_viernes = ${dto.hora_ent_am_viernes}, hora_sal_am_viernes = ${dto.hora_sal_am_viernes},
      hora_ent_viernes_pm = ${dto.hora_ent_viernes_pm}, hora_sal_viernes = ${dto.hora_sal_viernes}, 
      hora_ent_fds = ${dto.hora_ent_fds}, hora_sal_fds = ${dto.hora_sal_fds}
      WHERE nit_empleado = ${idUsuario}
    `;

    // Obtener los datos del horario para retornarlos
    const horarioData = await this.prisma.$queryRaw<Array<{ nit_empleado: number, sede: string, hora_ent_sem_am: string, hora_sal_sem_am: string, hora_ent_sem_pm: string, hora_sal_sem_pm: string, hora_ent_am_viernes: string, hora_sal_am_viernes: string, hora_ent_viernes_pm: string, hora_sal_viernes: string, hora_ent_fds: string, hora_sal_fds: string }>>`
      SELECT nit_empleado, sede, hora_ent_sem_am, hora_sal_sem_am, hora_ent_sem_pm, hora_sal_sem_pm, hora_ent_am_viernes, hora_sal_am_viernes, hora_ent_viernes_pm, hora_sal_viernes, hora_ent_fds, hora_sal_fds
      FROM postv_horarios_empleados
      WHERE nit_empleado = ${idUsuario}
    `;

    return new HorarioEntity({
      id: horarioData[0].nit_empleado.toString(),
      sede: horarioData[0].sede,
      hora_ent_sem_am: horarioData[0].hora_ent_sem_am,
      hora_sal_sem_am: horarioData[0].hora_sal_sem_am,
      hora_ent_sem_pm: horarioData[0].hora_ent_sem_pm,
      hora_sal_sem_pm: horarioData[0].hora_sal_sem_pm,
      hora_ent_am_viernes: horarioData[0].hora_ent_am_viernes,
      hora_sal_am_viernes: horarioData[0].hora_sal_am_viernes,
      hora_ent_pm_viernes: '', // Campo no existe en BD, mantener vacío para compatibilidad
      hora_sal_pm_viernes: '', // Campo no existe en BD, mantener vacío para compatibilidad
      hora_ent_viernes_pm: horarioData[0].hora_ent_viernes_pm || '',
      hora_sal_viernes: horarioData[0].hora_sal_viernes || '',
      hora_ent_fds: horarioData[0].hora_ent_fds,
      hora_sal_fds: horarioData[0].hora_sal_fds,
    });
  }

  async listarPerfiles(): Promise<PerfilesEntity[]> {
    const perfilesData = await this.prisma.$queryRaw<Array<{ id_perfil: number, nom_perfil: string }>>`
      SELECT id_perfil , nom_perfil
      FROM postv_perfiles
    `;
    return perfilesData.map((item) => new PerfilesEntity({ id: item.id_perfil.toString(), nombre: item.nom_perfil }));
  }


  async listarPerfilUsuario(id: number): Promise<PerfilesEntity[]> {
    const perfilData = await this.prisma.$queryRaw<Array<{ id_perfil: bigint, nom_perfil: string }>>`
      SELECT 
        w.perfil_postventa AS id_perfil,  -- ✅ CORRECCIÓN 1: Usar alias 'id_perfil'
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

  async deshabilitar(id: number): Promise<{ success: boolean; message: string }> {
    try {
      await this.prisma.w_sist_usuarios.update({
        where: { id_usuario: id },
        data: {
          estado: 0
        }
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

  async habilitar(id: number): Promise<{ success: boolean; message: string }> {
    try {
      await this.prisma.w_sist_usuarios.update({
        where: { id_usuario: id },
        data: {
          estado: 1
        }
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


  async verUsuariosJefes(): Promise<UsuarioEntity[]> {
    // Optimizado: Usar $queryRaw (seguro contra SQL injection)
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


  async verJefesAllGeneral(): Promise<JefesEntity[]> {
    // Optimizado: Usar $queryRaw (seguro contra SQL injection)
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

  async crearJefe(dto: CreateJefeDto): Promise<{ success: boolean; message: string }> {
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


  async verUsuarioPorNit(nit: string): Promise<boolean> {
    const usuarioData = await this.prisma.$queryRaw<{ nit_usuario: string }[]>`
      SELECT nit_usuario
      FROM w_sist_usuarios
      WHERE nit_usuario = ${nit}
    `;
    return usuarioData.length > 0;
  }

  async verTercero(nit: string): Promise<boolean> {
    const terceroData = await this.prisma.$queryRaw<{ nit: string }[]>`
      SELECT nit
      FROM terceros
      WHERE nit = ${nit}
    `;
    return terceroData.length > 0;
  }


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




}
