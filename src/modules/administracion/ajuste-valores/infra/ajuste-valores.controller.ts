import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  ParseIntPipe,
  Query,
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
    @Param('numero', ParseIntPipe) numero: number,
    @Query('tipo') tipo: string,
    @Body() dto: UpdateAjusteValoresDto,
  ) {
    return this.ajusteValoresFacade.actualizarValores(numero, tipo, dto);
  }
}
