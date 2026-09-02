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
import { ControlVehiculoFacade } from '../application/control-vehiculo.facade';
import { RegistrarLlegadaDto } from '../application/dto/registrar-llegada.dto';
import { RegistrarSalidaDto } from '../application/dto/registrar-salida.dto';

type AuthRequest = {
  cookies?: Record<string, string>;
  user?: { sub?: string; role?: string | number };
};

function empresaFromCookie(req: AuthRequest): number | undefined {
  const raw = req.cookies?.['user'];
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as { empresa?: unknown };
    if (parsed.empresa != null) return Number(parsed.empresa);
  } catch {
    /* ignore */
  }
  return undefined;
}

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
    const idEmpresa = empresaFromCookie(req);
    const payload: RegistrarSalidaDto = {
      ...dto,
      ...(idEmpresa != null ? { id_empresa: idEmpresa } : {}),
    };
    return this.facade.registrarSalida(payload, Number(userId), perfil);
  }

  @Put(':id/llegada')
  registrarLlegada(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RegistrarLlegadaDto,
  ) {
    return this.facade.registrarLlegada(id, dto);
  }

  @Get('vehiculos/modelos')
  listarModelos() {
    return this.facade.listarModelos();
  }

  @Get()
  listar(@Req() req: AuthRequest) {
    const perfil = req.user?.role != null ? Number(req.user.role) : undefined;
    return this.facade.listarVehiculos(perfil);
  }
}
