import { ForbiddenException } from '@nestjs/common';
import { PERFIL_SALUD_OCUPACIONAL } from '../../domain/mantenimiento.constants';
import type { SessionUser } from '../../domain/mantenimiento.repository';

export function assertPuedeMutarEquipos(user: SessionUser): void {
  if (user.perfil === PERFIL_SALUD_OCUPACIONAL) {
    throw new ForbiddenException('No puede modificar equipos');
  }
}
