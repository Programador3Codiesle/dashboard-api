import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { NominaDirectorFlotasFacade } from '../application/nomina-director-flotas.facade';
import { parseYearMonthParamStrict } from '../../shared/parse-year-month';

@Controller('nomina/nomina-director-flotas')
@UseGuards(JwtAuthGuard)
export class NominaDirectorFlotasController {
  constructor(private readonly facade: NominaDirectorFlotasFacade) {}

  @Get('principal')
  async principal(@Query('mes') mes: string) {
    const filtro = this.parseMes(mes);
    return this.facade.listarPrincipal(filtro);
  }

  @Get('detalle')
  async detalle(@Query('mes') mes: string) {
    const filtro = this.parseMes(mes);
    return this.facade.listarDetalle(filtro);
  }

  private parseMes(mes: string) {
    return parseYearMonthParamStrict(
      mes,
      'El parámetro mes es obligatorio y debe tener formato YYYY-MM.',
      'El parámetro mes es inválido.',
    );
  }
}
