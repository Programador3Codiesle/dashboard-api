import { Injectable, Inject } from '@nestjs/common';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';
import { IUsuarioCoreRepository } from '../../domain/repositories/usuario-core.repository';
import { encryptLegacyPassword } from '../crypto/encrypt-legacy-password';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(IUsuarioCoreRepository)
    private readonly coreRepo: IUsuarioCoreRepository,
  ) {}

  async resetPassword(id: number | string, dto: UpdateUsuarioDto) {
    const _id = typeof id === 'string' ? Number(id) : id;
    const passwordRaw = dto.nit ? String(dto.nit) : String(id);
    const encryptedPassword = encryptLegacyPassword(passwordRaw);

    return this.coreRepo.resetPassword(_id, encryptedPassword);
  }
}
