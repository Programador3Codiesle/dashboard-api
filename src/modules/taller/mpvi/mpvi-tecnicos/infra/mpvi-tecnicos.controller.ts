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
import { JwtAuthGuard } from '../../../../auth/infra/jwt-auth.guard';
import { MpviTecnicosFacade } from '../application/mpvi-tecnicos.facade';
import {
  GuardarDatosDto,
  ObtenerDatosDto,
  ObtenerItemsDto,
  ObtenerStockDto,
} from '../application/dto/mpvi-tecnicos.dto';

@UseGuards(JwtAuthGuard)
@Controller('taller/mpvi/tecnicos')
export class MpviTecnicosController {
  constructor(private readonly facade: MpviTecnicosFacade) {}

  @Post('items')
  obtenerItems(@Body() dto: ObtenerItemsDto) {
    return this.facade.obtenerItems(dto);
  }

  @Post('datos')
  obtenerDatos(@Body() dto: ObtenerDatosDto) {
    return this.facade.obtenerDatos(dto);
  }

  @Post('stock')
  obtenerStock(@Body() dto: ObtenerStockDto) {
    return this.facade.obtenerStock(dto);
  }

  @Post('guardar')
  guardarDatos(@Body() dto: GuardarDatosDto, @Req() req: { user?: { sub?: number } }) {
    const idUser = Number(req.user?.sub ?? 0);
    return this.facade.guardarDatos(dto, idUser);
  }

  @Get('pdf/:idCotizacion')
  async imprimirMpvi(
    @Param('idCotizacion', ParseIntPipe) idCotizacion: number,
    @Query('empresa') empresa?: string,
  ) {
    const idEmpresa = empresa ? Number(empresa) : undefined;
    const buffer = await this.facade.imprimirMpvi(idCotizacion, idEmpresa);
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `inline; filename="cotizacion-${idCotizacion}.pdf"`,
    });
  }
}
