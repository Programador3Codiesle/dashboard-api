import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { NominaDirectorFlotasFacade } from '../application/nomina-director-flotas.facade';

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
    if (!mes || !/^\d{4}-\d{2}$/.test(mes)) {
      throw new BadRequestException(
        'El parámetro mes es obligatorio y debe tener formato YYYY-MM.',
      );
    }
    const [anoStr, mesStr] = mes.split('-');
    const ano = Number(anoStr);
    const month = Number(mesStr);
    if (!ano || !month || month < 1 || month > 12) {
      throw new BadRequestException('El parámetro mes es inválido.');
    }
    return { ano, mes: month };
  }
}

