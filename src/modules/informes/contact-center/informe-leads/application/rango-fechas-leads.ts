import { BadRequestException } from '@nestjs/common';

const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;

export function exigirRangoFechas(desde: string, hasta: string): void {
  if (!FECHA_ISO.test(desde) || !FECHA_ISO.test(hasta)) {
    throw new BadRequestException('Indica un rango de fechas válido.');
  }
  const inicio = new Date(`${desde}T00:00:00`);
  const fin = new Date(`${hasta}T00:00:00`);
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
    throw new BadRequestException('Indica un rango de fechas válido.');
  }
  if (hasta < desde) {
    throw new BadRequestException(
      'La fecha final no puede ser anterior a la inicial.',
    );
  }
}
