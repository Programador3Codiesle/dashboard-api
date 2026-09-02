import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { ComisionesLaminaPinturaFacade } from '../application/comisiones-lamina-pintura.facade';
import {
  nominaNitFromRequest,
  nominaPerfilFromRequest,
  type NominaAuthRequest,
} from '../../shared/nomina-auth-request';

@Controller('nomina/comisiones-lamina-pintura')
@UseGuards(JwtAuthGuard)
export class ComisionesLaminaPinturaController {
  constructor(private readonly facade: ComisionesLaminaPinturaFacade) {}

  @Get()
  async listar(
    @Req() req: NominaAuthRequest,
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    this.validateDates(desde, hasta);
    const perfilUsuario = nominaPerfilFromRequest(req);
    const nitUsuarioSesion = nominaNitFromRequest(req);

    return this.facade.listar({
      desde,
      hasta,
      perfilUsuario,
      nitUsuarioSesion,
    });
  }

  @Get('detalle')
  async detalle(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
    @Query('nit') nit: string,
  ) {
    this.validateDates(desde, hasta);
    const nitNum = Number(nit);
    if (!nitNum) {
      throw new BadRequestException('El parámetro nit es obligatorio.');
    }
    return this.facade.obtenerDetalle({
      desde,
      hasta,
      nit: nitNum,
    });
  }

  @Get('total-repuestos-sede')
  async totalRepuestos(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
    @Query('sede') sede: string,
  ) {
    this.validateDates(desde, hasta);
    const sedeNum = Number(sede);
    if (![1, 2].includes(sedeNum)) {
      throw new BadRequestException('La sede debe ser 1 o 2.');
    }
    return this.facade.obtenerTotalRepuestosSede({
      desde,
      hasta,
      sede: sedeNum,
    });
  }

  private validateDates(desde: string, hasta: string) {
    if (!desde || !hasta) {
      throw new BadRequestException(
        'Los parámetros desde y hasta son obligatorios.',
      );
    }
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(desde) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(hasta)
    ) {
      throw new BadRequestException(
        'Los parámetros desde y hasta deben tener formato YYYY-MM-DD.',
      );
    }
    if (new Date(desde) > new Date(hasta)) {
      throw new BadRequestException('El rango de fechas es inválido.');
    }
  }
}
