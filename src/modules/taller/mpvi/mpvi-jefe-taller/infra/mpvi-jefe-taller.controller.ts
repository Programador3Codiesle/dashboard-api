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
import { MpviJefeTallerFacade } from '../application/mpvi-jefe-taller.facade';
import {
  GuardarDatosServicioDto,
  ObtenerDatosServicioDto,
} from '../application/dto/mpvi-jefe-taller.dto';

@UseGuards(JwtAuthGuard)
@Controller('taller/mpvi/jefe-taller')
export class MpviJefeTallerController {
  constructor(private readonly facade: MpviJefeTallerFacade) {}

  @Post('datos-servicio')
  obtenerDatosServicio(@Body() dto: ObtenerDatosServicioDto) {
    return this.facade.obtenerDatosServicio(dto);
  }

  @Post('guardar-servicio')
  guardarDatosServicio(
    @Body() dto: GuardarDatosServicioDto,
    @Req() req: { user?: { sub?: number } },
  ) {
    const idUser = Number(req.user?.sub ?? 0);
    return this.facade.guardarDatosServicio(dto, idUser);
  }

  @Get('pdf/:idCotizacion')
  async imprimirMpvi(
    @Param('idCotizacion', ParseIntPipe) idCotizacion: number,
    @Query('tipo') tipo?: string,
    @Query('empresa') empresa?: string,
  ) {
    const pdfTipo =
      tipo != null && tipo.trim() !== '' && !Number.isNaN(Number(tipo))
        ? Number(tipo)
        : 0;
    const idEmpresa = empresa ? Number(empresa) : undefined;
    const buffer = await this.facade.imprimirMpvi(
      idCotizacion,
      pdfTipo,
      idEmpresa,
    );
    const suffix =
      pdfTipo === 1 ? 'tecnico' : pdfTipo === 2 ? 'bdc' : 'servicio';
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `inline; filename="cotizacion-${suffix}-${idCotizacion}.pdf"`,
    });
  }
}
