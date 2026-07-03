import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../auth/infra/jwt-auth.guard';
import { MpviContactFacade } from '../application/mpvi-contact.facade';
import {
  DescartarCotizacionDto,
  ObtenerCotizacionContactDto,
} from '../application/dto/mpvi-contact.dto';

@UseGuards(JwtAuthGuard)
@Controller('taller/mpvi/contact')
export class MpviContactController {
  constructor(private readonly facade: MpviContactFacade) {}

  @Post('cotizaciones')
  obtenerCotizacionContact(@Body() dto: ObtenerCotizacionContactDto) {
    return this.facade.obtenerCotizacionContact(dto);
  }

  @Post('descartar')
  descartarCotizacion(@Body() dto: DescartarCotizacionDto) {
    return this.facade.descartarCotizacion(dto);
  }
}
