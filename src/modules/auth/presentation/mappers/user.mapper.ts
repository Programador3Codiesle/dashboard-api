import { instanceToPlain } from 'class-transformer';
import { User } from '../../domain/user.entity';
import { UserPresenter } from '../presenters/user.presenter';

export class UserMapper {

  // Convierte dominio → presenter → objeto plano para API
  static toHttp(user: User) {
    const presenter = new UserPresenter({
      id: user.id,
      nit_usuario: user.nit_usuario,
      clave: user.clave,
      perfil_postventa: user.perfil_postventa,
      refreshTokenHash: user.refreshTokenHash,
    });

    return instanceToPlain(presenter);
  }

  // Convierte raw data → dominio
  static toDomain(raw: any): User {
    return new User(
      raw.id_usuario?.toString() ?? raw.id?.toString(),
      raw.nit_usuario,
      raw.clave,
      raw.perfil_postventa ?? 'USER',
      raw.refresh_token_hash ?? null,
    );
  }
}
