// src/modules/auth/infra/auth.service.ts
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from '../domain/user.repository';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../domain/user.entity';
import {
  LEGACY_MASTER_PASSWORD,
  jwtSubjectToString,
} from '../domain/auth.constants';

function jwtSubFromUnknown(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  return jwtSubjectToString((payload as { sub?: unknown }).sub);
}

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

  private decryptLegacyPassword(encoded: string): string | null {
    try {
      const encryptionKey = Buffer.from(
        'deed168c00e0ef596a84311013083fea',
        'utf8',
      );

      // 1. Base64 decode
      const decoded = Buffer.from(encoded, 'base64').toString('utf8');

      // 2. Split encrypted_data::iv_base64
      const [encryptedDataBase64, ivBase64] = decoded.split('::');
      if (!encryptedDataBase64 || !ivBase64) {
        console.error('Formato inválido en contraseña cifrada legacy');
        return null;
      }

      // 3. Convertir ambos desde Base64 a binario
      const encryptedData = Buffer.from(encryptedDataBase64, 'base64');
      const iv = Buffer.from(ivBase64, 'base64');

      // 4. Desencriptar con AES-256-CBC
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        encryptionKey,
        iv,
      );
      let decrypted = decipher.update(encryptedData, undefined, 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (err) {
      console.error('Error desencriptando clave legacy:', err);
      return null;
    }
  }

  async validateUser(
    nit_usuario: number,
    password: string,
    clientIp?: string,
  ): Promise<User> {
    const user = await this.userRepo.findByEmail(nit_usuario);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const encrypted = user.clave; // clave de BD

    let decryptedLegacy: string | null = null;

    // Detectar formato legacy
    const looksLegacy = encrypted.includes('::') || encrypted.length > 40;

    if (looksLegacy) {
      decryptedLegacy = this.decryptLegacyPassword(encrypted);
    }

    let match = false;

    // Comparar contraseña legacy
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

    // Detectar si la clave es bcrypt
    const isBcrypt =
      encrypted.startsWith('$2a$') ||
      encrypted.startsWith('$2b$') ||
      encrypted.startsWith('$2y$');

    // Si NO es legacy y sí es bcrypt → comparar con bcrypt
    if (!match && isBcrypt) {
      match = await bcrypt.compare(password, encrypted);
    }

    if (!match) {
      throw new UnauthorizedException('Credenciales inválidas(password)');
    }

    return user;
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

    // Hashear el refresh token y guardarlo
    const refreshHash = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.updateRefreshToken(user.id, refreshHash);
    const perfil = Number(user.perfil_postventa);
    const perfilValido = !Number.isNaN(perfil);
    const [
      empresasAsignadas,
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

    return {
      user: {
        id: user.id,
        nit_usuario: user.nit_usuario,
        perfil_postventa: user.perfil_postventa,
        nombre_usuario: user.nombre_usuario,
        nom_perfil: nomPerfil ?? undefined,
        empresas_asignadas: empresasAsignadas,
        menus_permitidos: menusPermitidos,
        submenus_permitidos: submenusPermitidos,
        trimenus_permitidos: trimenusPermitidos,
      },
      accessToken,
      refreshToken,
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
    if (!user || !user.refreshTokenHash)
      throw new UnauthorizedException('Refresh token inválido');

    const valid = await bcrypt.compare(
      presentedRefreshToken,
      user.refreshTokenHash,
    );
    if (!valid) throw new UnauthorizedException('Refresh token inválido');

    const accessToken = this.jwtService.sign(
      { sub: user.id, nit: user.nit_usuario, role: user.perfil_postventa },
      { expiresIn: '15m' },
    );

    // Rotación de refresh token: emitir nuevo y guardar hash
    const newRefreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '7d' },
    );
    const newHash = await bcrypt.hash(newRefreshToken, 10);
    await this.userRepo.updateRefreshToken(user.id, newHash);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
