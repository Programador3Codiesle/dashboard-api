import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import {
  CODIESEL_EMPRESA_ID,
  readEmpresaIdFromCookie,
} from '../../../../core/config/empresa-sesion';
import { EntradaVehiculoFacade } from '../application/entrada-vehiculo.facade';
import {
  MarcarEntradaDto,
  ObtenerCitasProgramadasQueryDto,
  ObtenerPanelQueryDto,
  VehiculoSinCitaDto,
} from '../application/dto/entrada-vehiculo.dto';

type AuthRequest = Request & {
  user?: { nit?: number };
  cookies?: Record<string, string>;
};

function assertCodieselEmpresa(req: AuthRequest): void {
  const empresa = readEmpresaIdFromCookie(req.cookies);
  if (empresa !== CODIESEL_EMPRESA_ID) {
    throw new ForbiddenException(
      'Este módulo solo está disponible para Codiesel',
    );
  }
}

@UseGuards(JwtAuthGuard)
@Controller('taller/entrada-vehiculo')
export class EntradaVehiculoController {
  constructor(private readonly facade: EntradaVehiculoFacade) {}

  private getNit(req: AuthRequest): number {
    return Number(req.user?.nit ?? 0);
  }

  @Get()
  obtenerPanel(@Req() req: AuthRequest, @Query() query: ObtenerPanelQueryDto) {
    assertCodieselEmpresa(req);
    return this.facade.obtenerPanel(this.getNit(req), query.placa);
  }

  @Get('citas-programadas')
  obtenerCitasProgramadas(
    @Req() req: AuthRequest,
    @Query() query: ObtenerCitasProgramadasQueryDto,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.obtenerCitasProgramadasFecha(
      this.getNit(req),
      query.fecha,
    );
  }

  @Post('marcar-entrada')
  marcarEntrada(@Req() req: AuthRequest, @Body() dto: MarcarEntradaDto) {
    assertCodieselEmpresa(req);
    return this.facade.marcarEntrada(dto.idCita);
  }

  @Post('vehiculo-sin-cita')
  registrarVehiculoSinCita(
    @Req() req: AuthRequest,
    @Body() dto: VehiculoSinCitaDto,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.registrarVehiculoSinCita(this.getNit(req), dto);
  }
}
