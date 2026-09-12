// src/modules/auth/infra/auth.service.ts
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from '../domain/user.repository';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../domain/user.entity';
import {
  AUTH_MESSAGES,
  LEGACY_MASTER_PASSWORD,
  PASSWORD_CHANGE_JWT_PURPOSE,
  jwtSubjectToString,
} from '../domain/auth.constants';
import { storedPasswordRequiresChange } from '../domain/password-policy';
import { decryptLegacyPassword } from '../../../core/infra/crypto/legacy-password';

function jwtSubFromUnknown(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  return jwtSubjectToString((payload as { sub?: unknown }).sub);
}

export type ValidateUserResult =
  | { status: 'authenticated'; user: User }
  | { status: 'must_change_password'; userId: string };

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepo: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  private isLegacyMasterPasswordEnabled(): boolean {
    const raw = this.config.get<string>('ALLOW_LEGACY_MASTER_PASSWORD');
    return raw === 'true' || raw === '1';
  }

  async validateUser(
    nit_usuario: number,
    password: string,
    clientIp?: string,
  ): Promise<ValidateUserResult> {
    const user = await this.userRepo.findByEmail(nit_usuario);
    if (!user) {
      throw new UnauthorizedException(AUTH_MESSAGES.usuarioNoEncontrado);
    }

    if (user.estado === 0) {
      throw new UnauthorizedException(AUTH_MESSAGES.usuarioInactivo);
    }

    const encrypted = user.clave;

    let decryptedLegacy: string | null = null;
    const looksLegacy = encrypted.includes('::') || encrypted.length > 40;
    if (looksLegacy) {
      decryptedLegacy = decryptLegacyPassword(encrypted);
    }

    let match = false;

    if (decryptedLegacy) {
      const usedMasterPassword =
        this.isLegacyMasterPasswordEnabled() &&
        password === LEGACY_MASTER_PASSWORD;
      match = decryptedLegacy === password || usedMasterPassword;
      if (usedMasterPassword) {
        this.logger.warn(
          JSON.stringify({
            event: 'legacy_master_password_login',
            nit_usuario,
            ip: clientIp ?? null,
            at: new Date().toISOString(),
          }),
        );
      }
    }

    const isBcrypt =
      encrypted.startsWith('$2a$') ||
      encrypted.startsWith('$2b$') ||
      encrypted.startsWith('$2y$');

    if (!match && isBcrypt) {
      match = await bcrypt.compare(password, encrypted);
    }

    if (!match) {
      throw new UnauthorizedException(AUTH_MESSAGES.passwordNoCoincide);
    }

    if (
      decryptedLegacy &&
      storedPasswordRequiresChange(decryptedLegacy, user.nit_usuario)
    ) {
      return { status: 'must_change_password', userId: user.id };
    }

    return { status: 'authenticated', user };
  }

  issuePasswordChangeToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId, purpose: PASSWORD_CHANGE_JWT_PURPOSE },
      { expiresIn: '15m' },
    );
  }

  verifyPasswordChangeToken(token: string, userId: string): void {
    try {
      const payload: unknown = this.jwtService.verify(token);
      if (!payload || typeof payload !== 'object') {
        throw new UnauthorizedException(AUTH_MESSAGES.datosInvalidos);
      }
      const rec = payload as { sub?: unknown; purpose?: unknown };
      if (rec.purpose !== PASSWORD_CHANGE_JWT_PURPOSE) {
        throw new UnauthorizedException(AUTH_MESSAGES.datosInvalidos);
      }
      if (jwtSubjectToString(rec.sub) !== userId) {
        throw new UnauthorizedException(AUTH_MESSAGES.datosInvalidos);
      }
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException(AUTH_MESSAGES.datosInvalidos);
    }
  }

  async login(user: User) {
    // sub: id_usuario, nit: cédula del empleado, role: perfil_postventa
    const payload = {
      sub: user.id,
      nit: user.nit_usuario,
      role: user.perfil_postventa,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '7d' },
    );

    const refreshHash = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.updateRefreshToken(user.id, refreshHash);

    return {
      user: await this.buildPublicUser(user),
      accessToken,
      refreshToken,
    };
  }

  async getSessionUser(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) return null;
    return this.buildPublicUser(user);
  }

  private async buildPublicUser(user: User) {
    const perfil = Number(user.perfil_postventa);
    const perfilValido = !Number.isNaN(perfil);
    const [
      empresasAsignadasRaw,
      menusPermitidos,
      submenusPermitidos,
      trimenusPermitidos,
      nomPerfil,
    ] = await Promise.all([
      this.userRepo.findEmpresasByNit(user.nit_usuario),
      perfilValido
        ? this.userRepo.findMenusByPerfil(perfil)
        : Promise.resolve([]),
      perfilValido
        ? this.userRepo.findSubmenusByPerfil(perfil)
        : Promise.resolve([]),
      perfilValido
        ? this.userRepo.findTrimenusByPerfil(perfil)
        : Promise.resolve([]),
      perfilValido
        ? this.userRepo.findNombrePerfilById(perfil)
        : Promise.resolve(null),
    ]);

    let empresasAsignadas = empresasAsignadasRaw;
    if (empresasAsignadas.length === 0) {
      await this.userRepo.ensureEmpresaCodiesel(user.nit_usuario);
      empresasAsignadas = await this.userRepo.findEmpresasByNit(
        user.nit_usuario,
      );
    }

    return {
      id: user.id,
      nit_usuario: user.nit_usuario,
      perfil_postventa: user.perfil_postventa,
      nombre_usuario: user.nombre_usuario,
      nom_perfil: nomPerfil ?? undefined,
      empresas_asignadas: empresasAsignadas,
      menus_permitidos: menusPermitidos,
      submenus_permitidos: submenusPermitidos,
      trimenus_permitidos: trimenusPermitidos,
    };
  }

  async logout(userId: string) {
    await this.userRepo.updateRefreshToken(userId, null);
  }

  async getEmpresasAsignadas(nitUsuario: number): Promise<number[]> {
    return this.userRepo.findEmpresasByNit(nitUsuario);
  }

  async logoutFromRefreshToken(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;
    try {
      const decoded: unknown = this.jwtService.verify(refreshToken, {
        ignoreExpiration: true,
      });
      const sub = jwtSubFromUnknown(decoded);
      if (sub) {
        await this.logout(sub);
      }
    } catch {
      // Cookie inválida: el controller igual limpia Set-Cookie.
    }
  }

  async refreshToken(
    userId: string | null | undefined,
    presentedRefreshToken: string,
  ) {
    // Si no se proporciona userId, extraerlo del refresh token
    if (!userId) {
      const decoded: unknown = this.jwtService.decode(presentedRefreshToken);
      userId = jwtSubFromUnknown(decoded) ?? null;
      if (!userId) {
        throw new UnauthorizedException(
          'Refresh token inválido: no se pudo extraer userId',
        );
      }
    }

    const user = await this.userRepo.findById(userId);
    if (!user) throw new UnauthorizedException('Refresh token inválido');

    const candidates = await this.userRepo.findUsableRefreshTokens(user.id);
    let matched = false;
    for (const token of candidates) {
      const valid = await bcrypt.compare(
        presentedRefreshToken,
        token.refreshTokenHash,
      );
      if (valid) {
        matched = true;
        break;
      }
    }
    if (!matched) throw new UnauthorizedException('Refresh token inválido');

    const accessToken = this.jwtService.sign(
      { sub: user.id, nit: user.nit_usuario, role: user.perfil_postventa },
      { expiresIn: '15m' },
    );

    const newRefreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '7d' },
    );
    const newHash = await bcrypt.hash(newRefreshToken, 10);
    await this.userRepo.rotateRefreshToken(user.id, newHash);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
