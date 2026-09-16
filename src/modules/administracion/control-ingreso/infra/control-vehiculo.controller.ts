import {
  UseGuards,
  Controller,
  Post,
  Body,
  Put,
  Param,
  Get,
  Req,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { empresaIdDesdeCookie } from '../../../../core/config/empresa-sesion';
import { ControlVehiculoFacade } from '../application/control-vehiculo.facade';
import { RegistrarLlegadaDto } from '../application/dto/registrar-llegada.dto';
import { RegistrarSalidaDto } from '../application/dto/registrar-salida.dto';

type AuthRequest = {
  cookies?: Record<string, string>;
  user?: { sub?: string; role?: string | number };
};

@UseGuards(JwtAuthGuard)
@Controller('administracion/control-vehiculos')
export class ControlVehiculoController {
  constructor(private readonly facade: ControlVehiculoFacade) {}

  @Post('salida')
  registrarSalida(@Req() req: AuthRequest, @Body() dto: RegistrarSalidaDto) {
    const userId = req.user?.sub;
    const perfil = req.user?.role != null ? Number(req.user.role) : null;
    if (!perfil) {
      throw new BadRequestException('No se pudo obtener el perfil del usuario');
    }
    return this.facade.registrarSalida(
      dto,
      Number(userId),
      perfil,
      empresaIdDesdeCookie(req.cookies),
    );
  }

  @Put(':id/llegada')
  registrarLlegada(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RegistrarLlegadaDto,
  ) {
    return this.facade.registrarLlegada(
      id,
      dto,
      empresaIdDesdeCookie(req.cookies),
    );
  }

  @Get('vehiculos/modelos')
  listarModelos() {
    return this.facade.listarModelos();
  }

  @Get()
  listar(@Req() req: AuthRequest) {
    const perfil = req.user?.role != null ? Number(req.user.role) : undefined;
    return this.facade.listarVehiculos(
      perfil,
      empresaIdDesdeCookie(req.cookies),
    );
  }
}
