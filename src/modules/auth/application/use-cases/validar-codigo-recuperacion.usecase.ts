import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/user.repository';
import { AUTH_MESSAGES } from '../../domain/auth.constants';
import { encryptLegacyPassword } from '../../../../core/infra/crypto/legacy-password';

@Injectable()
export class ValidarCodigoRecuperacionUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(
    nit: number,
    codigo: string,
  ): Promise<{ ok: true } | { ok: false; message: string }> {
    const trimmed = codigo?.trim() ?? '';
    if (!trimmed) {
      return { ok: false, message: AUTH_MESSAGES.codigoIncorrecto };
    }

    const idUsuario = await this.userRepo.findUsuarioIdByCodVerificacion(
      nit,
      trimmed,
    );
    if (!idUsuario) {
      return { ok: false, message: AUTH_MESSAGES.codigoIncorrecto };
    }

    const encrypted = encryptLegacyPassword(String(nit));
    const updated = await this.userRepo.resetPasswordToNit(
      idUsuario,
      encrypted,
    );
    if (!updated) {
      return { ok: false, message: AUTH_MESSAGES.codigoIncorrecto };
    }

    return { ok: true };
  }
}
