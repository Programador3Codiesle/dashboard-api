import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AjusteValoresFacade } from '../application/ajuste-valores.facade';
import {
  AnoMesQueryDto,
  TipoNumeroQueryDto,
} from '../application/dto/ajuste-valores-query.dto';
import { UpdateAjusteValoresDto } from '../application/dto/update-ajuste-valores.dto';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('administracion/ajuste-valores')
export class AjusteValoresController {
  constructor(private readonly ajusteValoresFacade: AjusteValoresFacade) {}

  @Get('valores2')
  obtenerValores2(@Query() query: TipoNumeroQueryDto) {
    return this.ajusteValoresFacade.obtenerValores2(query.tipo, query.numero);
  }

  @Get('valores-cruce')
  obtenerValoresCruce(@Query() query: TipoNumeroQueryDto) {
    return this.ajusteValoresFacade.obtenerValoresCruce(
      query.tipo,
      query.numero,
    );
  }

  @Get('documentos-cerrados')
  validarDocumentosCerrados(@Query() query: AnoMesQueryDto) {
    return this.ajusteValoresFacade.validarDocumentosCerrados(
      query.ano,
      query.mes,
    );
  }

  @Get()
  obtenerValores(@Query() query: TipoNumeroQueryDto) {
    return this.ajusteValoresFacade.obtenerValores(query.tipo, query.numero);
  }

  @Put(':numero')
  actualizarValores(
    @Req() req: { user?: { sub?: string | number } },
    @Param('numero', ParseIntPipe) numero: number,
    @Query('tipo') tipo: string,
    @Body() dto: UpdateAjusteValoresDto,
  ) {
    const idUser = Number(req.user?.sub);
    if (!Number.isFinite(idUser) || idUser <= 0) {
      throw new BadRequestException('No se pudo identificar el usuario');
    }
    return this.ajusteValoresFacade.actualizarValores(
      idUser,
      numero,
      tipo,
      dto,
    );
  }
}
