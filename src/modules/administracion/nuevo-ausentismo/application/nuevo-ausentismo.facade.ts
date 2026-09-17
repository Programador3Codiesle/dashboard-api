import { Injectable } from '@nestjs/common';
import { CrearAusentismoUseCase } from './use-cases/crear-ausentismo.usecase';
import { ObtenerAusentismosCalendarioUseCase } from './use-cases/obtener-ausentismos-calendario.usecase';
import { CalcularTiempoRestanteAusentismoUseCase } from './use-cases/calcular-tiempo-restante-ausentismo.usecase';
import { ValidarDiaHabilAusentismoUseCase } from './use-cases/validar-dia-habil-ausentismo.usecase';
import { CreateAusentismoDto } from './dto/create-ausentismo.dto';

@Injectable()
export class NuevoAusentismoFacade {
  constructor(
    private readonly crearAusentismoUC: CrearAusentismoUseCase,
    private readonly obtenerCalendarioUC: ObtenerAusentismosCalendarioUseCase,
    private readonly calcularTiempoRestanteUC: CalcularTiempoRestanteAusentismoUseCase,
    private readonly validarDiaHabilUC: ValidarDiaHabilAusentismoUseCase,
  ) {}

  crearAusentismo(
    dto: CreateAusentismoDto,
    userId: number,
    adjunto?: Express.Multer.File,
  ) {
    return this.crearAusentismoUC.execute(dto, userId, adjunto);
  }

  obtenerCalendario(mes: number, anio: number, userId: number) {
    return this.obtenerCalendarioUC.execute(mes, anio, userId);
  }

  calcularTiempoRestante(nitEmpleado: number, horasAusentismo: number) {
    return this.calcularTiempoRestanteUC.execute(nitEmpleado, horasAusentismo);
  }

  validarDiaHabil(fechaYmd: string) {
    return this.validarDiaHabilUC.execute(fechaYmd);
  }
}
