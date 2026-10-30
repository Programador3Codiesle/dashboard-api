import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { esAdminContactCenter } from '../../shared/domain/cc-permisos';
import { getContactCenterSessionUser } from '../../shared/utils/contact-center-user.util';

/** Pantallas de auditar y configurar: perfiles 1, 20, 54 o NIT 37542439. */
@Injectable()
export class AuditoriaAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { perfil, nit } = getContactCenterSessionUser(
      context.switchToHttp().getRequest(),
    );
    if (!esAdminContactCenter(perfil, nit)) {
      throw new ForbiddenException('Acceso denegado');
    }
    return true;
  }
}
