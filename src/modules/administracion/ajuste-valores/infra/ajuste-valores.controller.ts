import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AjusteValoresFacade } from '../application/ajuste-valores.facade';
import { UpdateAjusteValoresDto } from '../application/dto/update-ajuste-valores.dto';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('administracion/ajuste-valores')
export class AjusteValoresController {
  constructor(private readonly ajusteValoresFacade: AjusteValoresFacade) {}

  @Get()
  obtenerValores(@Query('tipo') tipo: string, @Query('numero') numero: string) {
    return this.ajusteValoresFacade.obtenerValores(tipo, Number(numero));
  }

  @Get('valores2')
  obtenerValores2(
    @Query('tipo') tipo: string,
    @Query('numero') numero: string,
  ) {
    return this.ajusteValoresFacade.obtenerValores2(tipo, Number(numero));
  }

  @Get('valores-cruce')
  obtenerValoresCruce(
    @Query('tipo') tipo: string,
    @Query('numero') numero: string,
  ) {
    return this.ajusteValoresFacade.obtenerValoresCruce(tipo, Number(numero));
  }

  @Get('documentos-cerrados')
  validarDocumentosCerrados(
    @Query('ano') ano: string,
    @Query('mes') mes: string,
  ) {
    return this.ajusteValoresFacade.validarDocumentosCerrados(
      Number(ano),
      Number(mes),
    );
  }

  @Put(':numero')
  actualizarValores(
    @Param('numero') numero: string,
    @Query('tipo') tipo: string,
    @Body() dto: UpdateAjusteValoresDto,
  ) {
    return this.ajusteValoresFacade.actualizarValores(
      Number(numero),
      tipo,
      dto,
    );
  }
}
