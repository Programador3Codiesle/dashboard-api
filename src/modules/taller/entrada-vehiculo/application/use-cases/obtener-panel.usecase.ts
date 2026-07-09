import { Injectable } from '@nestjs/common';
import { IEntradaVehiculoRepository } from '../../domain/entrada-vehiculo.repository';
import {
  CitaEntradaEntity,
  EntradaVehiculoPanelEntity,
} from '../../domain/entrada-vehiculo.entity';

const ESTADOS_PROGRAMADAS = new Set(['Programada', 'Reprogramada']);

@Injectable()
export class ObtenerPanelUseCase {
  constructor(private readonly repo: IEntradaVehiculoRepository) {}

  async execute(
    nitUsuario: number,
    placa?: string,
  ): Promise<EntradaVehiculoPanelEntity> {
    const sedes = await this.repo.getSedesUsuario(nitUsuario);
    const bodegaIds = sedes.map((s) => s.idsede);

    const placaNorm = placa?.trim().toUpperCase();
    const byPlaca = !!placaNorm && placaNorm.length >= 6;

    if (byPlaca) {
      const citaPlaca = await this.repo.getCitasEntradaVhPlaca(
        bodegaIds,
        placaNorm,
      );
      const citasSinOt = await this.repo.getVhSinOtPlaca(bodegaIds, placaNorm);
      const vehiculosSinCita = await this.repo.getVhSinCitaPlaca(
        bodegaIds,
        placaNorm,
      );

      return {
        sedes,
        citasProgramadas: citaPlaca.filter((c) =>
          ESTADOS_PROGRAMADAS.has(c.descripcionEstado),
        ),
        citasAtendidas: citaPlaca.filter(
          (c) => c.descripcionEstado === 'Atendida',
        ),
        citasSinOt,
        vehiculosSinCita,
      };
    }

    const citasRaw = await this.repo.getCitasEntradaVh(bodegaIds);
    const citasAtendidasRaw =
      await this.repo.getCitasEntradaVhAtendidas(bodegaIds);
    const citasSinOt = await this.repo.getVhSinOt(bodegaIds);
    const vehiculosSinCita = await this.repo.getVhSinCita(bodegaIds);

    return {
      sedes,
      citasProgramadas: citasRaw.filter((c) =>
        ESTADOS_PROGRAMADAS.has(c.descripcionEstado),
      ),
      citasAtendidas: citasAtendidasRaw.filter(
        (c) => c.descripcionEstado === 'Atendida',
      ),
      citasSinOt,
      vehiculosSinCita,
    };
  }
}

@Injectable()
export class ObtenerCitasProgramadasFechaUseCase {
  constructor(private readonly repo: IEntradaVehiculoRepository) {}

  async execute(
    nitUsuario: number,
    fecha: string,
  ): Promise<CitaEntradaEntity[]> {
    const sedes = await this.repo.getSedesUsuario(nitUsuario);
    const bodegaIds = sedes.map((s) => s.idsede);
    const rows = await this.repo.getCitasEntradaVhFecha(bodegaIds, fecha);
    return rows.filter((c) => ESTADOS_PROGRAMADAS.has(c.descripcionEstado));
  }
}
