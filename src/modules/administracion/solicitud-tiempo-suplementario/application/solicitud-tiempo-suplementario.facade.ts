import { Injectable } from '@nestjs/common';
import { CrearTiempoSuplementarioUseCase } from './use-cases/crear-tiempo-suplementario.usecase';
import { ObtenerCalendarioTiempoSuplementarioUseCase } from './use-cases/obtener-calendario-tiempo-suplementario.usecase';
import { CreateTiempoSuplementarioDto } from './dto/create-tiempo-suplementario.dto';

@Injectable()
export class SolicitudTiempoSuplementarioFacade {
    constructor(
        private readonly crearTiempoUC: CrearTiempoSuplementarioUseCase,
        private readonly obtenerCalendarioUC: ObtenerCalendarioTiempoSuplementarioUseCase
    ) {}

    crearSolicitud(dto: CreateTiempoSuplementarioDto) {
        return this.crearTiempoUC.execute(dto);
    }

    obtenerCalendario(mes: number, anio: number) {
        return this.obtenerCalendarioUC.execute(mes, anio);
    }
}
