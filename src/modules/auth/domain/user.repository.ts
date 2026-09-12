import { User } from './user.entity';

export type StoredRefreshToken = {
  id: number;
  refreshTokenHash: string;
  revokedAt: Date | null;
  expiresAt: Date;
};

export abstract class IUserRepository {
  abstract findByEmail(nit_usuario: number): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract findEmpresasByNit(nit_usuario: number): Promise<number[]>;
  abstract ensureEmpresaCodiesel(nit_usuario: number): Promise<void>;
  abstract countUsuariosByNit(nit_usuario: number): Promise<number>;
  abstract updateCodVerificacion(
    nit_usuario: number,
    codigo: string,
  ): Promise<boolean>;
  abstract findCorreoCorporativoCodiesel(
    nit_usuario: number,
  ): Promise<string | null>;
  abstract findUsuarioIdByCodVerificacion(
    nit_usuario: number,
    codigo: string,
  ): Promise<string | null>;
  abstract resetPasswordToNit(
    idUsuario: string,
    encryptedPassword: string,
  ): Promise<boolean>;
  abstract updatePasswordForzado(
    idUsuario: string,
    encryptedPassword: string,
    claveMd5: string,
  ): Promise<boolean>;
  abstract findMenusByPerfil(perfil: number): Promise<number[]>;
  abstract findSubmenusByPerfil(perfil: number): Promise<number[]>;
  abstract findTrimenusByPerfil(perfil: number): Promise<number[]>;
  abstract findNombrePerfilById(perfil: number): Promise<string | null>;
  abstract create(
    user: Partial<User> & { passwordHash: string },
  ): Promise<User>;
  abstract updateRefreshToken(
    id: string,
    refreshTokenHash: string | null,
  ): Promise<void>;
  abstract findUsableRefreshTokens(id: string): Promise<StoredRefreshToken[]>;
  abstract rotateRefreshToken(
    id: string,
    refreshTokenHash: string,
  ): Promise<void>;
}
