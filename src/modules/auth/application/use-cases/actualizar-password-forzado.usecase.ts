import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/user.repository';
import { AuthService } from '../../infra/auth.service';
import { AUTH_MESSAGES } from '../../domain/auth.constants';
import { isNuevaPasswordValida } from '../../domain/password-policy';
import {
  encryptLegacyPassword,
  md5Hex,
} from '../../../../core/infra/crypto/legacy-password';
import { ActualizarPasswordForzadoDto } from '../dto/actualizar-password.dto';

@Injectable()
export class ActualizarPasswordForzadoUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepo: IUserRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(dto: ActualizarPasswordForzadoDto): Promise<{
    status: boolean;
    message: string;
  }> {
    if (!dto.pass1 || !dto.pass2 || !dto.userId || !dto.changeToken) {
      return { status: false, message: AUTH_MESSAGES.datosInvalidos };
    }
    if (dto.pass1 !== dto.pass2) {
      return { status: false, message: AUTH_MESSAGES.passwordsNoCoinciden };
    }

    this.authService.verifyPasswordChangeToken(dto.changeToken, dto.userId);

    const user = await this.userRepo.findById(dto.userId);
    if (!user) {
      return { status: false, message: AUTH_MESSAGES.datosInvalidos };
    }
    if (!isNuevaPasswordValida(dto.pass2, user.nit_usuario)) {
      return { status: false, message: AUTH_MESSAGES.passwordDebil };
    }

    const encrypted = encryptLegacyPassword(dto.pass2);
    const claveMd5 = md5Hex(dto.pass1);
    const ok = await this.userRepo.updatePasswordForzado(
      dto.userId,
      encrypted,
      claveMd5,
    );
    if (!ok) {
      return { status: false, message: AUTH_MESSAGES.datosInvalidos };
    }
    return { status: true, message: AUTH_MESSAGES.passwordActualizada };
  }
}
