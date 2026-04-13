import { Injectable } from '@nestjs/common';
import { CrearAusentismoUseCase } from './use-cases/crear-ausentismo.usecase';
import { ObtenerAusentismosCalendarioUseCase } from './use-cases/obtener-ausentismos-calendario.usecase';
import { CreateAusentismoDto } from './dto/create-ausentismo.dto';

@Injectable()
export class NuevoAusentismoFacade {
  constructor(
    private readonly crearAusentismoUC: CrearAusentismoUseCase,
    private readonly obtenerCalendarioUC: ObtenerAusentismosCalendarioUseCase,
  ) {}

  crearAusentismo(dto: CreateAusentismoDto, userId: number) {
    return this.crearAusentismoUC.execute(dto, userId);
  }

  obtenerCalendario(mes: number, anio: number, userId: number) {
    return this.obtenerCalendarioUC.execute(mes, anio, userId);
  }
}
