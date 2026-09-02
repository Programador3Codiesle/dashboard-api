import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { ComisionesAsesoresRepuestosFacade } from '../application/comisiones-asesores-repuestos.facade';
import {
  nominaPerfilFromRequest,
  type NominaAuthRequest,
} from '../../shared/nomina-auth-request';

@Controller('nomina/comisiones-asesores-repuestos')
@UseGuards(JwtAuthGuard)
export class ComisionesAsesoresRepuestosController {
  constructor(private readonly facade: ComisionesAsesoresRepuestosFacade) {}

  @Get()
  async listar(
    @Req() req: NominaAuthRequest,
    @Query('mes') mes: string,
    @Query('ano') ano: string,
    @Query('asesorNombre') asesorNombre?: string,
  ) {
    const mesNum = Number(mes);
    const anoNum = Number(ano);
    if (!mesNum || mesNum < 1 || mesNum > 12) {
      throw new BadRequestException('El parámetro mes es obligatorio (1-12).');
    }
    if (!anoNum || anoNum < 2020) {
      throw new BadRequestException(
        'El parámetro ano es obligatorio y válido.',
      );
    }

    const now = new Date();
    const anoActual = now.getFullYear();
    const mesActual = now.getMonth() + 1;
    if (anoNum === anoActual && mesNum >= mesActual) {
      throw new BadRequestException(
        'No se permite consultar año y mes actual o futuro.',
      );
    }

    const perfilUsuario = nominaPerfilFromRequest(req);
    return this.facade.listarComisiones({
      mes: mesNum,
      ano: anoNum,
      perfilUsuario,
      nombreUsuarioSesion: asesorNombre ?? null,
    });
  }

  @Get('detalle')
  async detalle(
    @Query('nom') nom: string,
    @Query('sede') sede: string,
    @Query('mes') mes: string,
    @Query('ano') ano: string,
  ) {
    const mesNum = Number(mes);
    const anoNum = Number(ano);
    if (!nom || nom.trim() === '') {
      throw new BadRequestException('El parámetro nom es obligatorio.');
    }
    if (!sede || sede.trim() === '') {
      throw new BadRequestException('El parámetro sede es obligatorio.');
    }
    if (!mesNum || mesNum < 1 || mesNum > 12) {
      throw new BadRequestException('El parámetro mes es obligatorio (1-12).');
    }
    if (!anoNum || anoNum < 2020) {
      throw new BadRequestException(
        'El parámetro ano es obligatorio y válido.',
      );
    }

    return this.facade.obtenerDetalle({
      nom: nom.trim(),
      sede: sede.trim(),
      mes: mesNum,
      ano: anoNum,
    });
  }
}
