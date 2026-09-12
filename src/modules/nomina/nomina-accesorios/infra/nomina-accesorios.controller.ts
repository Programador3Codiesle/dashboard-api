import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { NominaAccesoriosFacade } from '../application/nomina-accesorios.facade';
import {
  nominaNitFromRequest,
  nominaPerfilFromRequest,
  type NominaAuthRequest,
} from '../../shared/nomina-auth-request';
import { CodieselEmpresaGuard } from '../../shared/utils/codiesel-empresa.guard';

@Controller('nomina/nomina-accesorios')
@UseGuards(JwtAuthGuard, CodieselEmpresaGuard)
export class NominaAccesoriosController {
  constructor(private readonly facade: NominaAccesoriosFacade) {}

  @Get()
  listar(
    @Req() req: NominaAuthRequest,
    @Query('ano') ano: string,
    @Query('mes') mes: string,
    @Query('perfil') perfil: string,
  ) {
    const anoNum = Number(ano);
    const mesNum = Number(mes);
    const tipo = Number(perfil);
    if (!anoNum || !mesNum || !tipo) {
      throw new BadRequestException('Parámetros de consulta inválidos.');
    }
    return this.facade.listar({
      ano: anoNum,
      mes: mesNum,
      tipo,
      perfilUsuario: nominaPerfilFromRequest(req),
      nitUsuarioSesion: nominaNitFromRequest(req),
    });
  }
}
