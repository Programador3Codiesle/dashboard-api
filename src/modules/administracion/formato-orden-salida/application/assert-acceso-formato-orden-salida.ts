import { ForbiddenException } from '@nestjs/common';
import {
  nitFormatoOrdenSalida,
  puedeAccederFormatoOrdenSalida,
} from './orden-salida-php.constants';

export function assertAccesoFormatoOrdenSalida(
  nit: string | number | null | undefined,
): number {
  const n = nitFormatoOrdenSalida(nit);
  if (!puedeAccederFormatoOrdenSalida(n)) {
    throw new ForbiddenException(
      'No tiene permisos para el formato de orden de salida',
    );
  }
  return n;
}
