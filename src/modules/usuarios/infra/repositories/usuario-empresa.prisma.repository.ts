/**
 * Repositorio de Usuario - Gestión de Empresas
 * Implementa IUsuarioEmpresaRepository siguiendo Clean Architecture
 */
import { Injectable } from "@nestjs/common";
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import { AssignEmpresaDto } from "../../application/dto/assign-empresa.dto";
import { IUsuarioEmpresaRepository } from "../../domain/repositories/usuario-empresa.repository";

@Injectable()
export class UsuarioEmpresaRepository implements IUsuarioEmpresaRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtener las empresas asignadas a un usuario
   */
  async findEmpresasByUsuario(cedula: string): Promise<{ id_empresa: number }[]> {
    return this.prisma.$queryRaw`
      SELECT idEmpresa 
      FROM sw_empresa_usuario
      WHERE idUsuario = CAST(${cedula} AS DECIMAL(18,0))
        AND estado = 1
      ORDER BY idEmpresa
    `;
  }

  /**
   * Agregar empresas a un usuario de forma segura (batch)
   */
  async addEmpresasSafe(cedula: string, empresasIds: string[]): Promise<string[]> {
    const agregadas: string[] = [];

    if (empresasIds.length === 0) return agregadas;

    await this.prisma.$transaction(async (tx) => {
      try {
        // Obtener todas las empresas existentes en una sola query
        const existentes = await tx.$queryRaw<Array<{ idEmpresa: number }>>`
          SELECT idEmpresa
          FROM sw_empresa_usuario
          WHERE idUsuario = CAST(${cedula} AS DECIMAL(18,0))
            AND idEmpresa IN (${Prisma.join(empresasIds.map(id => parseInt(id)))})
            AND estado = 1
        `;

        const existentesSet = new Set(existentes.map(e => e.idEmpresa));

        // Filtrar solo las que no existen
        const nuevasEmpresas = empresasIds.filter(id => !existentesSet.has(parseInt(id)));

        // Insertar todas las nuevas en batch
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

  /**
   * Verificar si existe una empresa
   */
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

  /**
   * Eliminar empresas de un usuario
   */
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
}
