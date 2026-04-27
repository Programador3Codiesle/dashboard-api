import { User } from './user.entity';

export abstract class IUserRepository {
  abstract findByEmail(nit_usuario: number): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract findEmpresasByNit(nit_usuario: number): Promise<number[]>;
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
}
