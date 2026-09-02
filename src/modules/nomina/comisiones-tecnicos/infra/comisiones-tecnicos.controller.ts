import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { ComisionesTecnicosFacade } from '../application/comisiones-tecnicos.facade';
import { parseYearMonthParam } from '../../shared/parse-year-month';
import {
  nominaNitFromRequest,
  nominaPerfilFromRequest,
  type NominaAuthRequest,
} from '../../shared/nomina-auth-request';

@Controller('nomina/comisiones-tecnicos')
@UseGuards(JwtAuthGuard)
export class ComisionesTecnicosController {
  constructor(private readonly facade: ComisionesTecnicosFacade) {}

  @Get()
  async listar(@Req() req: NominaAuthRequest, @Query('mes') mes: string) {
    const { ano, mes: mesNum } = parseYearMonthParam(
      mes,
      'El parámetro mes es obligatorio con formato YYYY-MM.',
    );
    return this.facade.listar({
      ano,
      mes: mesNum,
      perfilUsuario: nominaPerfilFromRequest(req),
      nitUsuarioSesion: nominaNitFromRequest(req),
    });
  }

  @Get('detalle')
  async detalle(
    @Query('mes') mes: string,
    @Query('anio') anio: string,
    @Query('nit') nit: string,
  ) {
    const mesNum = Number(mes);
    const anioNum = Number(anio);
    const nitNum = Number(nit);
    if (!mesNum || !anioNum || !nitNum) {
      throw new BadRequestException('Parámetros inválidos para detalle.');
    }
    return this.facade.detalle({
      mes: mesNum,
      ano: anioNum,
      nit: nitNum,
    });
  }
}
