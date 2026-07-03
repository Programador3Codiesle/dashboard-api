import { Injectable } from '@nestjs/common';
import { ObtenerDatosServicioUseCase } from './use-cases/obtener-datos-servicio.usecase';
import { GuardarDatosServicioUseCase } from './use-cases/guardar-datos-servicio.usecase';
import { ImprimirMpviServicioUseCase } from './use-cases/imprimir-mpvi-servicio.usecase';
import type {
  GuardarDatosServicioDto,
  ObtenerDatosServicioDto,
} from './dto/mpvi-jefe-taller.dto';

@Injectable()
export class MpviJefeTallerFacade {
  constructor(
    private readonly obtenerDatosServicioUC: ObtenerDatosServicioUseCase,
    private readonly guardarDatosServicioUC: GuardarDatosServicioUseCase,
    private readonly imprimirMpviServicioUC: ImprimirMpviServicioUseCase,
  ) {}

  obtenerDatosServicio(dto: ObtenerDatosServicioDto) {
    return this.obtenerDatosServicioUC.execute(dto.op, dto.idCotizacion);
  }

  guardarDatosServicio(dto: GuardarDatosServicioDto, idUser: number) {
    return this.guardarDatosServicioUC.execute(dto, idUser);
  }

  imprimirMpvi(idCotizacion: number, tipo = 0, idEmpresa?: number) {
    return this.imprimirMpviServicioUC.execute(idCotizacion, tipo, idEmpresa);
  }
}
