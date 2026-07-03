import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { EntradaVehiculoFacade } from '../application/entrada-vehiculo.facade';
import {
  MarcarEntradaDto,
  ObtenerCitasProgramadasQueryDto,
  ObtenerPanelQueryDto,
  VehiculoSinCitaDto,
} from '../application/dto/entrada-vehiculo.dto';

@UseGuards(JwtAuthGuard)
@Controller('taller/entrada-vehiculo')
export class EntradaVehiculoController {
  constructor(private readonly facade: EntradaVehiculoFacade) {}

  private getNit(req: Request): number {
    const user = (req as Request & { user?: { nit?: number } }).user;
    return Number(user?.nit ?? 0);
  }

  @Get()
  obtenerPanel(@Req() req: Request, @Query() query: ObtenerPanelQueryDto) {
    return this.facade.obtenerPanel(this.getNit(req), query.placa);
  }

  @Get('citas-programadas')
  obtenerCitasProgramadas(
    @Req() req: Request,
    @Query() query: ObtenerCitasProgramadasQueryDto,
  ) {
    return this.facade.obtenerCitasProgramadasFecha(
      this.getNit(req),
      query.fecha,
    );
  }

  @Post('marcar-entrada')
  marcarEntrada(@Body() dto: MarcarEntradaDto) {
    return this.facade.marcarEntrada(dto.idCita);
  }

  @Post('vehiculo-sin-cita')
  registrarVehiculoSinCita(
    @Req() req: Request,
    @Body() dto: VehiculoSinCitaDto,
  ) {
    return this.facade.registrarVehiculoSinCita(this.getNit(req), dto);
  }
}
