import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { EstadoTallerFacade } from '../application/estado-taller.facade';
import {
  AgregarEventoDto,
  FacturaMesActualDto,
  ObtenerPanelQueryDto,
  ValoresEstimadosDto,
} from '../application/dto/estado-taller.dto';

@UseGuards(JwtAuthGuard)
@Controller('taller/estado-taller')
export class EstadoTallerController {
  constructor(private readonly facade: EstadoTallerFacade) {}

  private getNit(req: Request): number {
    const user = (req as Request & { user?: { nit?: number } }).user;
    return Number(user?.nit ?? 0);
  }

  private getUserId(req: Request): number {
    const user = (req as Request & { user?: { sub?: number } }).user;
    return Number(user?.sub ?? 0);
  }

  @Get()
  obtenerPanel(@Req() req: Request, @Query() query: ObtenerPanelQueryDto) {
    const idEmpresa =
      query.id_empresa != null &&
      Number.isFinite(query.id_empresa) &&
      query.id_empresa > 0
        ? query.id_empresa
        : undefined;
    return this.facade.obtenerPanel(this.getNit(req), query.bodega, idEmpresa);
  }

  @Get('total-abiertas')
  obtenerTotalAbiertas(
    @Req() req: Request,
    @Query() query: ObtenerPanelQueryDto,
  ) {
    const idEmpresa =
      query.id_empresa != null &&
      Number.isFinite(query.id_empresa) &&
      query.id_empresa > 0
        ? query.id_empresa
        : undefined;
    return this.facade.obtenerTotalAbiertas(
      this.getNit(req),
      query.bodega,
      idEmpresa,
    );
  }

  @Get('estados')
  obtenerEstadosCatalogo() {
    return this.facade.obtenerEstadosCatalogo();
  }

  @Get('historial/:numeroOrden')
  obtenerHistorial(@Param('numeroOrden', ParseIntPipe) numeroOrden: number) {
    return this.facade.obtenerHistorial(numeroOrden);
  }

  @Get('cotizaciones-sacyr/:numeroOrden')
  obtenerCotizacionesSacyr(
    @Param('numeroOrden', ParseIntPipe) numeroOrden: number,
  ) {
    return this.facade.obtenerCotizacionesSacyr(numeroOrden);
  }

  @Post('evento')
  agregarEvento(@Body() dto: AgregarEventoDto) {
    return this.facade.agregarEvento(dto);
  }

  @Post('factura-mes-actual')
  guardarFacturaMesActual(
    @Req() req: Request,
    @Body() dto: FacturaMesActualDto,
  ) {
    return this.facade.guardarFacturaMesActual(this.getUserId(req), dto);
  }

  @Post('valores-estimados')
  guardarValoresEstimados(
    @Req() req: Request,
    @Body() dto: ValoresEstimadosDto,
  ) {
    return this.facade.guardarValoresEstimados(this.getUserId(req), dto);
  }
}
