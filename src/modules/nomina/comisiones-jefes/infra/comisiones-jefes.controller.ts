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
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { ComisionesJefesFacade } from '../application/comisiones-jefes.facade';
import { parseYearMonthParam } from '../../shared/parse-year-month';
import {
  nominaNitFromRequest,
  nominaPerfilFromRequest,
  type NominaAuthRequest,
} from '../../shared/nomina-auth-request';
import {
  toActualizarValoresHttpResponse,
  toCheckValoresHttpResponse,
} from '../application/mappers/comisiones-jefes.http';

@Controller('nomina/comisiones-jefes')
@UseGuards(JwtAuthGuard)
export class ComisionesJefesController {
  constructor(private readonly facade: ComisionesJefesFacade) {}

  @Get()
  async listar(@Req() req: NominaAuthRequest, @Query('mes') mes: string) {
    const { ano, mes: mesNum } = parseYearMonthParam(
      mes,
      'El parámetro mes es obligatorio con formato YYYY-MM.',
    );
    const perfilUsuario = nominaPerfilFromRequest(req);
    const nitUsuarioSesion = nominaNitFromRequest(req);

    return this.facade.listarComisiones({
      mes: mesNum,
      ano,
      perfilUsuario,
      nitUsuarioSesion,
    });
  }

  @Get('detalle')
  async detalle(
    @Query('mes') mes: string,
    @Query('anio') anio: string,
    @Query('nit') nit: string,
    @Query('sede') sede: string,
  ) {
    const mesNum = Number(mes);
    const anioNum = Number(anio);
    const nitNum = Number(nit);
    if (!mesNum || !anioNum || !nitNum || !sede) {
      throw new BadRequestException('Parámetros inválidos para detalle.');
    }
    return this.facade.obtenerDetalle({
      mes: mesNum,
      ano: anioNum,
      nit: nitNum,
      sede,
    });
  }

  @Get('jefes-por-sede')
  async jefesPorSede(@Query('sede') sede: string) {
    if (!sede) {
      throw new BadRequestException('El parámetro sede es obligatorio.');
    }
    const data = await this.facade.obtenerJefesPorSede(sede);
    return { status: data.length > 0, data };
  }

  @Post('check-valores')
  async checkValores(
    @Body('combo_jefes') comboJefes: string,
    @Body('sede') sede: string,
  ) {
    if (!comboJefes || !sede) {
      throw new BadRequestException('combo_jefes y sede son obligatorios.');
    }
    const result = await this.facade.checkValoresMesAnterior({
      comboJefes,
      sede,
    });
    return toCheckValoresHttpResponse(result);
  }

  @Post('actualizar-valores')
  async actualizarValores(
    @Body('combo_jefes') comboJefes: string,
    @Body('sede') sede: string,
    @Body('utilidad_sede') utilidadSede?: string,
    @Body('bono_nps') bonoNps?: string,
    @Body('bono_utilidad') bonoUtilidad?: string,
    @Body('bono_nps_int') bonoNpsInterno?: string,
  ) {
    const result = await this.facade.actualizarValores({
      comboJefes,
      sede,
      utilidadSede:
        utilidadSede != null && utilidadSede !== ''
          ? Number(utilidadSede)
          : null,
      bonoNps: bonoNps === '1',
      bonoUtilidad: bonoUtilidad === '1',
      bonoNpsInterno: bonoNpsInterno === '1',
    });

    return toActualizarValoresHttpResponse(result);
  }
}
