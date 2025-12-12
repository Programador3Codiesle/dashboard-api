import { Injectable } from "@nestjs/common";
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import { UsuarioMapper } from "../../presentation/mappers/usuario.mapper";
import { CreateUsuarioDto } from "../../application/dto/create-usuario.dto";
import { UpdateUsuarioDto } from "../../application/dto/update-usuario.dto";

@Injectable()
export class UsuarioRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateUsuarioDto) {
        const usuario = await this.prisma.w_sist_usuarios.create({
            data: dto as any, // TODO: Map fields correctly to w_sist_usuarios
        });
        return UsuarioMapper.toDomain(usuario);
    }

    async findAll() {
        
        const sql = `SELECT
            u.id_usuario,
            p.nom_perfil,
            t.nombres,
            u.usuario,
            CAST(u.nit_usuario AS VARCHAR(20)) AS nit,
            CASE 
                WHEN u.estado_usuario = 1 THEN 'ACTIVO'
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
            FROM
            w_sist_usuarios u
            INNER JOIN
            terceros t ON t.nit = u.nit_usuario
            LEFT JOIN
            postv_horarios_empleados h ON CAST(h.nit_empleado AS DECIMAL(18,0)) = u.nit_usuario
            INNER JOIN
            postv_perfiles p ON p.id_perfil = u.perfil_postventa
            GROUP BY
            u.id_usuario,
            p.nom_perfil,
            t.nombres,
            u.usuario,
            u.nit_usuario,
            u.estado_usuario,
            h.sede,
			u.fecha_hora_crea_usu,
            u.fecha_hora_mod_usu
            ORDER BY
            u.id_usuario DESC
        `;

        const results = await this.prisma.$queryRawUnsafe<any[]>(sql);

        return results.map(UsuarioMapper.toDomainWithJoins);

    }

    async findById(id: number) {
        const usuario = await this.prisma.w_sist_usuarios.findUnique({ where: { id_usuario: id } });
        if (!usuario) return null;
        return UsuarioMapper.toDomain(usuario);
    }

    async update(id: number, dto: UpdateUsuarioDto) {
        const usuario = await this.prisma.w_sist_usuarios.update({
            where: { id_usuario: id },
            data: dto as any, // TODO: Map fields correctly to w_sist_usuarios
        });
        return UsuarioMapper.toDomain(usuario);
    }

    async delete(id: number) {
        await this.prisma.w_sist_usuarios.delete({ where: { id_usuario: id } });
    }


 async findEmpresasByUsuario(cedula: string): Promise<{ id_empresa: number }[]> {
    // REEMPLAZA "tu_tabla_usuario_empresa" con el NOMBRE REAL de tu tabla
    return this.prisma.$queryRaw`
      SELECT idEmpresa 
      FROM sw_empresa_usuario  -- ⚠️ REEMPLAZA con tu tabla real
      WHERE idUsuario = CAST(${cedula} AS DECIMAL(18,0))
        AND estado = 1
      ORDER BY idEmpresa
    `;
  }

  async addEmpresasSafe(cedula: string, empresasIds: string[]): Promise<string[]> {
    const agregadas: string[] = [];

    // ✅ Usar transacción implícita de Prisma
    await this.prisma.$transaction(async (tx) => {
      for (const empresaId of empresasIds) {
        try {
          // Verificar si ya existe
          const existe = await tx.$queryRaw<Array<{ existe: number }>>`
            SELECT 1 as existe
            FROM sw_empresa_usuario  -- ⚠️ REEMPLAZA con tu tabla real
            WHERE idUsuario = CAST(${cedula} AS DECIMAL(18,0))
              AND idEmpresa = ${parseInt(empresaId)}
              AND estado = 1
          `;

          if (!existe || existe.length === 0) {
            // No existe, insertar
            await tx.$executeRaw`
              INSERT INTO sw_empresa_usuario  -- ⚠️ REEMPLAZA con tu tabla real
              (idEmpresa, idUsuario, estado) 
              VALUES (${parseInt(empresaId)}, CAST(${cedula} AS DECIMAL(18,0)), 1)
            `;
            agregadas.push(empresaId);
          }
        } catch (error) {
          // Log del error pero continuar con las demás
          console.error(`Error al agregar empresa ${empresaId}:`, error.message);
        }
      }
    });

    return agregadas;
  }

  async existsEmpresa(id: string): Promise<boolean> {
    const result = await this.prisma.$queryRaw<Array<{ existe: number }>>`
      SELECT CASE 
        WHEN EXISTS (
          SELECT 1 
          FROM sw_empresa  -- ⚠️ REEMPLAZA con tu tabla de empresas
          WHERE id = ${parseInt(id)}
            AND estado = 1
        ) THEN 1 
        ELSE 0 
      END as existe
    `;
    
    return result[0]?.existe === 1;
  }

  // ✅ Método de transacción
  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }











}
