import { BadRequestException } from '@nestjs/common';

export function parseMonthFromYearMonth(value: string): number {
  const parts = value.split('-');
  return Number(parts[1]);
}

export function assertPygPeriodo(dto: {
  yearOne: number;
  yearTwo: number;
  monthOne: string;
  monthTwo: string;
}): { monthOne: number; monthTwo: number } {
  if (dto.yearTwo >= dto.yearOne) {
    throw new BadRequestException(
      'El año a comparar debe ser menor al año del informe',
    );
  }

  const monthOne = parseMonthFromYearMonth(dto.monthOne);
  const monthTwo = parseMonthFromYearMonth(dto.monthTwo);

  if (!Number.isFinite(monthOne) || !Number.isFinite(monthTwo)) {
    throw new BadRequestException('Mes inválido en los filtros');
  }

  if (monthOne > monthTwo) {
    throw new BadRequestException(
      'El mes DESDE debe ser menor o igual al mes HASTA',
    );
  }

  return { monthOne, monthTwo };
}
