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

@Controller('nomina/comisiones-jefes')
@UseGuards(JwtAuthGuard)
export class ComisionesJefesController {
  constructor(private readonly facade: ComisionesJefesFacade) {}

  @Get()
  async listar(@Req() req: any, @Query('mes') mes: string) {
    if (!mes || !/^\d{4}-\d{2}$/.test(mes)) {
      throw new BadRequestException(
        'El parámetro mes es obligatorio con formato YYYY-MM.',
      );
    }
    const [anoStr, mesStr] = mes.split('-');
    const ano = Number(anoStr);
    const mesNum = Number(mesStr);
    const perfilUsuario = req.user?.role ? Number(req.user.role) : null;
    const nitUsuarioSesion = req.user?.nit ? Number(req.user.nit) : null;

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
    return {
      status: result.data.length > 0,
      title: result.data.length > 0 ? 'Exito' : 'Advertencia',
      icon: result.data.length > 0 ? 'success' : 'warning',
      message:
        result.data.length > 0
          ? 'Cargando la información de los bonos.'
          : 'No se ha encontrado información en la base de datos, con los campos seleccionados.',
      data: result.data,
      bono: result.bonoMatriz ? [result.bonoMatriz] : null,
    };
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

    return {
      status: result.updated,
      title: result.updated ? 'Exito' : 'Error',
      icon: result.updated ? 'success' : 'error',
      message: result.message,
    };
  }
}
