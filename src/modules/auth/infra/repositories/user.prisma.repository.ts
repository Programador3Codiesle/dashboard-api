import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import {
  IUserRepository,
  StoredRefreshToken,
} from '../../domain/user.repository';
import { User } from '../../domain/user.entity';
import { REFRESH_REUSE_WINDOW_MS } from '../../domain/refresh-token.util';

function toUserIdString(value: unknown): string {
  if (typeof value === 'string' && value.length > 0) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'bigint') return value.toString();
  return String(value);
}

type UsuarioQueryRow = {
  id_usuario: string | number | bigint;
  nit_usuario: number;
  pass?: string | null;
  clave?: string | null;
  perfil_postventa?: string | number | null;
  nombres?: string | null;
  refresh_token_hash?: string | null;
};
function isTokensTableMissing(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as {
    code?: string;
    message?: string;
    meta?: {
      driverAdapterError?: { kind?: string; cause?: { kind?: string } };
    };
  };
  return (
    err.code === 'P2021' ||
    err.code === 'P2010' ||
    err.meta?.driverAdapterError?.kind === 'TableDoesNotExist' ||
    err.meta?.driverAdapterError?.cause?.kind === 'TableDoesNotExist' ||
    (typeof err.message === 'string' &&
      err.message.includes("Invalid object name 'Tokens'"))
  );
}

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
      SELECT DISTINCT CAST(tp.id_trimenu AS INT) AS id_trimenu
      FROM postv_trimenu_perfil tp
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
    const results = await this.prisma.$queryRaw<UsuarioQueryRow[]>`
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
      toUserIdString(u.id_usuario),
      Number(u.nit_usuario),
      u.pass ?? u.clave ?? '',
      u.perfil_postventa?.toString() ?? 'USER',
      undefined,
      u.nombres ?? undefined,
    );
  }

  async findById(id: string): Promise<User | null> {
    const results = await this.prisma.$queryRaw<UsuarioQueryRow[]>`
            SELECT TOP 1
                u.id_usuario, 
                u.nit_usuario, 
                u.pass, 
                u.clave, 
                u.perfil_postventa,
                t.refresh_token_hash,
                terc.nombres
            FROM w_sist_usuarios u
            LEFT JOIN terceros terc ON terc.nit = u.nit_usuario
            LEFT JOIN Tokens t ON t.id_usuario = u.id_usuario
            WHERE u.id_usuario = ${Number(id)}
            ORDER BY t.id DESC
        `;

    const u = results[0];
    if (!u) return null;
    return new User(
      toUserIdString(u.id_usuario),
      Number(u.nit_usuario),
      u.pass ?? u.clave ?? '',
      u.perfil_postventa?.toString() ?? 'USER',
      u.refresh_token_hash || undefined,
      u.nombres ?? undefined,
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
    } catch (error: unknown) {
      if (isTokensTableMissing(error)) {
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

  async findUsableRefreshTokens(id: string): Promise<StoredRefreshToken[]> {
    try {
      const now = new Date();
      const graceCutoff = new Date(now.getTime() - REFRESH_REUSE_WINDOW_MS);
      const rows = await this.prisma.$queryRaw<
        Array<{
          id: number;
          refresh_token_hash: string;
          revoked_at: Date | null;
          expires_at: Date;
        }>
      >`
        SELECT id, refresh_token_hash, revoked_at, expires_at
        FROM Tokens
        WHERE id_usuario = ${Number(id)}
          AND expires_at > ${now}
          AND (revoked_at IS NULL OR revoked_at >= ${graceCutoff})
      `;

      return rows
        .map((row) => ({
          id: Number(row.id),
          refreshTokenHash: row.refresh_token_hash,
          revokedAt: row.revoked_at ? new Date(row.revoked_at) : null,
          expiresAt: new Date(row.expires_at),
        }))
        .filter((row) => Number.isFinite(row.id) && row.refreshTokenHash);
    } catch (error: unknown) {
      if (isTokensTableMissing(error)) {
        return [];
      }
      throw error;
    }
  }

  async rotateRefreshToken(
    id: string,
    refreshTokenHash: string,
  ): Promise<void> {
    try {
      const now = new Date();
      const graceCutoff = new Date(now.getTime() - REFRESH_REUSE_WINDOW_MS);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await this.prisma.$executeRaw`
        DELETE FROM Tokens
        WHERE id_usuario = ${Number(id)}
          AND revoked_at IS NOT NULL
          AND revoked_at < ${graceCutoff}
      `;

      await this.prisma.$executeRaw`
        UPDATE Tokens
        SET revoked_at = ${now}, replaced_by = NEWID()
        WHERE id_usuario = ${Number(id)}
          AND revoked_at IS NULL
      `;

      await this.prisma.$executeRaw`
        INSERT INTO Tokens (id_usuario, refresh_token_hash, expires_at)
        VALUES (${Number(id)}, ${refreshTokenHash}, ${expiresAt})
      `;
    } catch (error: unknown) {
      if (isTokensTableMissing(error)) {
        console.warn('La tabla Tokens no existe. El refresh no se persistirá.');
        return;
      }
      throw error;
    }
  }
}
