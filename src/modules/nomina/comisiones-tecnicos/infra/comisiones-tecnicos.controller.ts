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

@Controller('nomina/comisiones-tecnicos')
@UseGuards(JwtAuthGuard)
export class ComisionesTecnicosController {
  constructor(private readonly facade: ComisionesTecnicosFacade) {}

  @Get()
  async listar(@Req() req: any, @Query('mes') mes: string) {
    if (!mes || !/^\d{4}-\d{2}$/.test(mes)) {
      throw new BadRequestException(
        'El parámetro mes es obligatorio con formato YYYY-MM.',
      );
    }
    const [anoStr, mesStr] = mes.split('-');
    return this.facade.listar({
      ano: Number(anoStr),
      mes: Number(mesStr),
      perfilUsuario: req.user?.role ? Number(req.user.role) : null,
      nitUsuarioSesion: req.user?.nit ? Number(req.user.nit) : null,
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

