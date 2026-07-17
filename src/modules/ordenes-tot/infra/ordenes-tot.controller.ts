import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/infra/jwt-auth.guard';
import { CrearRepuestoDto } from '../application/dto/crear-repuesto.dto';
import { CrearTotDto } from '../application/dto/crear-tot.dto';
import { CrearVehiculoDto } from '../application/dto/crear-vehiculo.dto';
import { ListadoTotQueryDto } from '../application/dto/listado-tot-query.dto';
import { ValidarOrdenQueryDto } from '../application/dto/validar-orden-query.dto';
import { OrdenesTotFacade } from '../application/ordenes-tot.facade';

type AuthUser = {
  sub?: number | string;
  nit?: number | string;
  role?: number | string;
};

type AuthRequest = {
  user?: AuthUser;
};

@UseGuards(JwtAuthGuard)
@Controller('ordenes-tot')
export class OrdenesTotController {
  constructor(private readonly facade: OrdenesTotFacade) {}

  @Post('vehiculos')
  crearVehiculo(@Req() req: AuthRequest, @Body() dto: CrearVehiculoDto) {
    return this.facade.crearVehiculo(dto, this.idUsuario(req));
  }

  @Post('tot')
  async crearTot(@Req() req: AuthRequest, @Body() dto: CrearTotDto) {
    const buffer = await this.facade.crearTot(dto, this.idUsuario(req));
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `inline; filename="tot-${String(dto.orden)}.pdf"`,
    });
  }

  @Post('repuestos')
  crearRepuesto(@Req() req: AuthRequest, @Body() dto: CrearRepuestoDto) {
    return this.facade.crearRepuesto(dto, this.idUsuario(req));
  }

  @Get('tot/listado')
  listarTot(@Req() req: AuthRequest, @Query() query: ListadoTotQueryDto) {
    return this.facade.listarTot(
      this.idUsuario(req),
      query.estado,
      this.nitUsuario(req),
    );
  }

  @Post('tot/:id/reingreso')
  marcarReingreso(@Param('id', ParseIntPipe) id: number) {
    return this.facade.marcarReingreso(id);
  }

  @Get('porteria/vehiculos')
  porteriaVehiculos() {
    return this.facade.porteriaVehiculos();
  }

  @Get('porteria/tot')
  porteriaTot(@Req() req: AuthRequest) {
    return this.facade.porteriaTot(this.idUsuario(req), this.nitUsuario(req));
  }

  @Get('porteria/ordenes-generales')
  porteriaOrdenesGenerales() {
    return this.facade.porteriaOrdenesGenerales();
  }

  @Post('porteria/:id/confirmar-salida')
  confirmarSalida(@Param('id', ParseIntPipe) id: number) {
    return this.facade.confirmarSalida(id);
  }

  @Get('validar-orden')
  validarOrden(@Query() query: ValidarOrdenQueryDto) {
    return this.facade.validarOrden(query.orden);
  }

  @Get('tot/:id/recibo')
  async reciboTot(@Param('id', ParseIntPipe) id: number) {
    const buffer = await this.facade.generarPdfRecibo(id);
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `inline; filename="tot-${id}.pdf"`,
    });
  }

  @Get('vehiculos/pendientes')
  vehiculosPendientes(@Req() req: AuthRequest) {
    return this.facade.listarVehiculosPendientes(
      this.idUsuario(req),
      this.nitUsuario(req),
    );
  }

  @Get('repuestos/candidatos')
  repuestosCandidatos() {
    return this.facade.listarRepuestosCandidatos();
  }

  private idUsuario(req: AuthRequest): number {
    return Number(req.user?.sub ?? 0);
  }

  private nitUsuario(req: AuthRequest): number {
    return Number(req.user?.nit ?? 0);
  }
}
