import { Body, Controller, Get, Post } from '@nestjs/common';
import { EncuestasFacade } from '../application/encuestas.facade';
import {
  ActualizarTerceroDto,
  BuscarNitDto,
  BuscarPlacaDto,
  RegistrarUsuarioQrDto,
  ResponderEncuestaQrDto,
  SinEncuestaDto,
} from '../application/dto/encuestas.dto';

/** Endpoints públicos de Satisfacción QR (sin JWT), equivalente a orden_salida/encuesta. No añadir JwtAuthGuard. */
@Controller('encuestas/qr')
export class EncuestaQrController {
  constructor(private readonly facade: EncuestasFacade) {}

  @Get('preguntas')
  listarPreguntas() {
    return this.facade.listarPreguntasQr();
  }

  @Post('buscar-placa')
  buscarPlaca(@Body() dto: BuscarPlacaDto) {
    return this.facade.buscarPlaca(dto.placa);
  }

  @Post('buscar-nit')
  buscarNit(@Body() dto: BuscarNitDto) {
    return this.facade.buscarNit(dto.nit_cc, dto.placa);
  }

  @Post('registrar-usuario')
  registrarUsuario(@Body() dto: RegistrarUsuarioQrDto) {
    return this.facade.registrarUsuario({
      nit: dto.user_nit_comprador_up,
      nombres: dto.user_nombres_up,
      celular: dto.user_celular_up,
      email: dto.user_email_up,
      placa: dto.inputPlacaOrden,
      opcion: dto.opcion,
    });
  }

  @Post('actualizar-tercero')
  actualizarTercero(@Body() dto: ActualizarTerceroDto) {
    return this.facade.actualizarTercero(dto);
  }

  @Post('responder')
  responder(@Body() dto: ResponderEncuestaQrDto) {
    return this.facade.responderEncuesta(dto);
  }

  @Post('sin-encuesta')
  sinEncuesta(@Body() dto: SinEncuestaDto) {
    return this.facade.sinEncuesta(dto);
  }
}
