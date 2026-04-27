import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import { IUserRepository } from '../../domain/user.repository';
import { User } from '../../domain/user.entity';

@Injectable()
export class UserPrismaRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findEmpresasByNit(nit_usuario: number): Promise<number[]> {
    const empresas = await this.prisma.$queryRaw<Array<{ idEmpresa: number }>>`
      SELECT idEmpresa
      FROM sw_empresa_usuario
      WHERE idUsuario = CAST(${nit_usuario} AS DECIMAL(18,0))
        AND estado = 1
      ORDER BY idEmpresa
    `;

    return empresas
      .map((item) => Number(item.idEmpresa))
      .filter((id) => !Number.isNaN(id));
  }

  async findMenusByPerfil(perfil: number): Promise<number[]> {
    const menus = await this.prisma.$queryRaw<Array<{ id_menu: number }>>`
      SELECT m.id_menu
      FROM postv_menu_perfil mp
      INNER JOIN postv_menus m ON m.id_menu = mp.menu
      WHERE mp.perfil = ${perfil}
        AND m.vista_menu = 'a'
      ORDER BY m.id_menu
    `;

    return menus
      .map((item) => Number(item.id_menu))
      .filter((id) => !Number.isNaN(id));
  }

  async findSubmenusByPerfil(perfil: number): Promise<number[]> {
    const submenus = await this.prisma.$queryRaw<Array<{ id_submenu: number }>>`
      SELECT s.id_submenu
      FROM postv_submenu_perfiles sp
      INNER JOIN postv_submenu s ON s.id_submenu = sp.submenu
      WHERE sp.perfil = ${perfil}
      ORDER BY s.id_submenu
    `;

    return submenus
      .map((item) => Number(item.id_submenu))
      .filter((id) => !Number.isNaN(id));
  }

  async findTrimenusByPerfil(perfil: number): Promise<number[]> {
    const trimenus = await this.prisma.$queryRaw<Array<{ id_trimenu: number }>>`
      SELECT DISTINCT CAST(t.id_trimenu AS INT) AS id_trimenu
      FROM postv_trimenu_perfil tp
      INNER JOIN postv_trimenu t ON t.id_trimenu = tp.id_trimenu
      WHERE tp.id_perfil = ${perfil}
      ORDER BY id_trimenu
    `;

    return trimenus
      .map((item) => Number(item.id_trimenu))
      .filter((id) => !Number.isNaN(id));
  }

  async findNombrePerfilById(perfil: number): Promise<string | null> {
    const rows = await this.prisma.$queryRaw<Array<{ nom_perfil: string }>>`
      SELECT TOP 1 nom_perfil
      FROM postv_perfiles
      WHERE id_perfil = ${perfil}
    `;
    const nom = rows[0]?.nom_perfil;
    return typeof nom === 'string' && nom.trim() ? nom.trim() : null;
  }

  async findByEmail(nit_usuario: number): Promise<User | null> {
    // Optimizado: Una sola query con JOIN en lugar de 2 queries separadas (N+1)
    const results = await this.prisma.$queryRaw<any[]>`
            SELECT 
                u.id_usuario,
                u.nit_usuario,
                u.pass,
                u.clave,
                u.perfil_postventa,
                t.nombres
            FROM w_sist_usuarios u
            LEFT JOIN terceros t ON t.nit = u.nit_usuario
            WHERE u.nit_usuario = ${nit_usuario}
        `;

    const u = results[0];
    if (!u) return null;

    return new User(
      u.id_usuario?.toString() ?? String(u.id_usuario),
      Number(u.nit_usuario),
      u.pass ?? u.clave,
      u.perfil_postventa?.toString() ?? 'USER',
      undefined,
      u.nombres,
    );
  }

  async findById(id: string): Promise<User | null> {
    const results: any[] = await this.prisma.$queryRaw<any[]>`
            SELECT TOP 1
                u.id_usuario, 
                u.nit_usuario, 
                u.pass, 
                u.clave, 
                u.perfil_postventa, 
                t.refresh_token_hash
            FROM w_sist_usuarios u
            LEFT JOIN Tokens t ON t.id_usuario = u.id_usuario
            WHERE u.id_usuario = ${Number(id)}
            ORDER BY t.id DESC
        `;

    const u = results[0];
    if (!u) return null;
    return new User(
      u.id_usuario?.toString() ?? String(u.id_usuario),
      Number(u.nit_usuario),
      u.pass ?? u.clave ?? '',
      u.perfil_postventa?.toString() ?? 'USER',
      u.refresh_token_hash || undefined,
    );
  }

  async create(
    userLike: Partial<User> & { passwordHash: string },
  ): Promise<User> {
    if (!userLike.nit_usuario) {
      throw new Error('Email (NIT) is required for user creation');
    }

    const created = await this.prisma.w_sist_usuarios.create({
      data: {
        nit_usuario: Number(userLike.nit_usuario),
        clave: userLike.passwordHash.slice(0, 32),
        pass: userLike.passwordHash,
        perfil_postventa:
          userLike.perfil_postventa && userLike.perfil_postventa !== 'USER'
            ? Number(userLike.perfil_postventa)
            : undefined,
        tipo_tercero: 1,
        fid_perfil: 1,
      },
    });

    return new User(
      created.id_usuario?.toString() ?? String(created.id_usuario),
      Number(created.nit_usuario),
      created.pass ?? created.clave ?? '',
      created.perfil_postventa?.toString() ?? 'USER',
    );
  }

  async updateRefreshToken(
    id: string,
    refreshTokenHash: string | null,
  ): Promise<void> {
    try {
      // Eliminar tokens anteriores del usuario
      await this.prisma.$executeRaw`
                DELETE FROM Tokens WHERE id_usuario = ${Number(id)}
            `;

      if (refreshTokenHash) {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.prisma.$executeRaw`
                    INSERT INTO Tokens (id_usuario, refresh_token_hash, expires_at) 
                    VALUES (${Number(id)}, ${refreshTokenHash}, ${expiresAt})
                `;
      }
    } catch (error: any) {
      // Si la tabla no existe, solo registramos el error pero no fallamos
      // Verificar diferentes códigos de error de Prisma y diferentes formas de detectar tabla inexistente
      const isTableDoesNotExist =
        error?.code === 'P2021' ||
        error?.code === 'P2010' ||
        error?.meta?.driverAdapterError?.kind === 'TableDoesNotExist' ||
        error?.meta?.driverAdapterError?.cause?.kind === 'TableDoesNotExist' ||
        (error?.message &&
          error.message.includes("Invalid object name 'Tokens'"));

      if (isTableDoesNotExist) {
        console.warn(
          'La tabla Tokens no existe en la base de datos. Por favor, ejecuta la migración de Prisma para crearla.',
        );
        console.warn(
          'El sistema continuará funcionando, pero los refresh tokens no se guardarán hasta que se cree la tabla.',
        );
        return;
      }
      throw error;
    }
  }
}
