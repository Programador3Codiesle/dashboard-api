import { Injectable } from '@nestjs/common';
import { CrearTiempoSuplementarioUseCase } from './use-cases/crear-tiempo-suplementario.usecase';
import { ObtenerCalendarioTiempoSuplementarioUseCase } from './use-cases/obtener-calendario-tiempo-suplementario.usecase';
import { CreateTiempoSuplementarioDto } from './dto/create-tiempo-suplementario.dto';

@Injectable()
export class SolicitudTiempoSuplementarioFacade {
  constructor(
    private readonly crearTiempoUC: CrearTiempoSuplementarioUseCase,
    private readonly obtenerCalendarioUC: ObtenerCalendarioTiempoSuplementarioUseCase,
  ) {}

  crearSolicitud(dto: CreateTiempoSuplementarioDto, userId: number) {
    return this.crearTiempoUC.execute(dto, userId);
  }

  obtenerCalendario(mes: number, anio: number, userId: number) {
    return this.obtenerCalendarioUC.execute(mes, anio, userId);
  }
}
