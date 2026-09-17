import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdenSalidaFacade } from '../application/orden-salida.facade';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { CrearOrdenSalidaDto } from '../application/dto/crear-orden-salida.dto';
import { assertAccesoFormatoOrdenSalida } from '../application/assert-acceso-formato-orden-salida';
import { nitFormatoOrdenSalida } from '../application/orden-salida-php.constants';

@UseGuards(JwtAuthGuard)
@Controller('administracion/formato-orden-salida')
export class OrdenSalidaController {
  constructor(private readonly facade: OrdenSalidaFacade) {}

  /**
   * Tipos de salida permitidos para el jefe elegido (PHP generarComboTiposSalidas).
   */
  @Get('tipos-salida')
  obtenerTiposSalida(
    @Req() req: { user?: { nit?: string | number } },
    @Query('nitJefe') nitJefe?: string,
  ) {
    assertAccesoFormatoOrdenSalida(req.user?.nit);
    const jefeNit =
      nitFormatoOrdenSalida(nitJefe) ?? nitFormatoOrdenSalida(req.user?.nit);

    if (!jefeNit) {
      throw new BadRequestException(
        'No se pudo determinar el jefe para obtener los tipos de salida',
      );
    }

    return this.facade.obtenerTiposSalida(jefeNit);
  }

  @Post()
  crear(
    @Req() req: { user?: { nit?: string | number } },
    @Body() dto: CrearOrdenSalidaDto,
  ) {
    const userNit = assertAccesoFormatoOrdenSalida(req.user?.nit);
    return this.facade.crearOrdenSalida(userNit, dto);
  }
}
