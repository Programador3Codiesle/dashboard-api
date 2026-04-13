import {
  UseGuards,
  Controller,
  Post,
  Body,
  Put,
  Param,
  Get,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/infra/jwt-auth.guard';
import { ControlVehiculoFacade } from '../application/control-vehiculo.facade';
import { RegistrarLlegadaDto } from '../application/dto/registrar-llegada.dto';
import { RegistrarSalidaDto } from '../application/dto/registrar-salida.dto';

@UseGuards(JwtAuthGuard)
@Controller('administracion/control-vehiculos')
export class ControlVehiculoController {
  constructor(private readonly facade: ControlVehiculoFacade) {}

  @Post('salida')
  registrarSalida(@Req() req: any, @Body() dto: RegistrarSalidaDto) {
    const userId = req.user.sub;

    // Obtener el perfil del usuario desde el token JWT (req.user.role contiene el perfil_postventa)
    const perfil = req.user?.role ? Number(req.user.role) : null;

    if (!perfil) {
      throw new BadRequestException('No se pudo obtener el perfil del usuario');
    }

    // Obtener empresa del cookie 'user'
    if (req.cookies && req.cookies['user']) {
      try {
        const userCookie = JSON.parse(req.cookies['user']);
        if (userCookie && userCookie.empresa) {
          dto.id_empresa = Number(userCookie.empresa);
        }
      } catch (e) {
        console.error('Error parsing user cookie:', e);
      }
    }

    return this.facade.registrarSalida(dto, Number(userId), perfil);
  }

  @Put(':id/llegada')
  registrarLlegada(@Param('id') id: string, @Body() dto: RegistrarLlegadaDto) {
    return this.facade.registrarLlegada(Number(id), dto);
  }

  @Get()
  listar(@Req() req: any) {
    // Obtener el perfil del usuario desde el token JWT (req.user.role contiene el perfil_postventa)
    const perfil = req.user?.role ? Number(req.user.role) : undefined;
    return this.facade.listarVehiculos(perfil);
  }

  @Get('vehiculos/modelos')
  listarModelos() {
    return this.facade.listarModelos();
  }
}
