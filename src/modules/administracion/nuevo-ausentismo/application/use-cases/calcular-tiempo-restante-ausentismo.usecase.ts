import { Injectable } from '@nestjs/common';
import { INuevoAusentismoRepository } from '../../domain/nuevo-ausentismo.repository';
import { minToHorasTexto } from '../../../shared/hora-militar';

export type TiempoRestanteAusentismo = {
  texto: string;
  requiereRecuperacion: boolean;
};

@Injectable()
export class CalcularTiempoRestanteAusentismoUseCase {
  constructor(private readonly repo: INuevoAusentismoRepository) {}

  async execute(
    nitEmpleado: number,
    horasAusentismo: number,
  ): Promise<TiempoRestanteAusentismo> {
    const minutosNuevos = Number.isFinite(horasAusentismo)
      ? horasAusentismo * 60
      : 0;
    const minutosBanco = await this.repo.minutosBancoTiempo();
    const minutosUsados =
      await this.repo.minutosAusentismosPersonalesAnio(nitEmpleado);
    const disponibles = minutosBanco - (minutosUsados + minutosNuevos);

    if (disponibles < 0) {
      return {
        texto:
          'Has superado el tiempo otorgado por CODIESEL, debes especificar como recuperarás el tiempo solicitado',
        requiereRecuperacion: true,
      };
    }
    if (disponibles === 0) {
      return {
        texto:
          'Has completado el tiempo otorgado por CODIESEL, en el siguiente ausentismo deberás especificar el tiempo a recuperar',
        requiereRecuperacion: false,
      };
    }
    return {
      texto: `De la chequera de tiempo otorgada por CODIESEL te quedarían ${minToHorasTexto(disponibles)}`,
      requiereRecuperacion: false,
    };
  }
}
