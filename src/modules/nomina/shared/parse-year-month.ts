import { BadRequestException } from '@nestjs/common';

export function parseYearMonthParam(
  mes: string,
  requiredMessage: string,
): { ano: number; mes: number } {
  if (!mes || !/^\d{4}-\d{2}$/.test(mes)) {
    throw new BadRequestException(requiredMessage);
  }
  const [anoStr, mesStr] = mes.split('-');
  return { ano: Number(anoStr), mes: Number(mesStr) };
}

export function parseYearMonthParamStrict(
  mes: string,
  requiredMessage: string,
  invalidMessage: string,
): { ano: number; mes: number } {
  const parsed = parseYearMonthParam(mes, requiredMessage);
  if (!parsed.ano || !parsed.mes || parsed.mes < 1 || parsed.mes > 12) {
    throw new BadRequestException(invalidMessage);
  }
  return parsed;
}
