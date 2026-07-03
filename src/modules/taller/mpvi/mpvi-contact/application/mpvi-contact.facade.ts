import { Injectable } from '@nestjs/common';
import { ObtenerCotizacionContactUseCase } from './use-cases/obtener-cotizacion-contact.usecase';
import { DescartarCotizacionUseCase } from './use-cases/descartar-cotizacion.usecase';
import type {
  DescartarCotizacionDto,
  ObtenerCotizacionContactDto,
} from './dto/mpvi-contact.dto';

@Injectable()
export class MpviContactFacade {
  constructor(
    private readonly obtenerCotizacionContactUC: ObtenerCotizacionContactUseCase,
    private readonly descartarCotizacionUC: DescartarCotizacionUseCase,
  ) {}

  obtenerCotizacionContact(dto: ObtenerCotizacionContactDto) {
    return this.obtenerCotizacionContactUC.execute(dto.placa);
  }

  descartarCotizacion(dto: DescartarCotizacionDto) {
    return this.descartarCotizacionUC.execute(dto.idCotizacion);
  }
}
