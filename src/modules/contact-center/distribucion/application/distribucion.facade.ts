import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ToggleDistribucionDto,
  UpdateDistribucionDto,
} from './dto/distribucion.dto';
import { DistribucionRepository } from '../infra/repositories/distribucion.repository';

@Injectable()
export class DistribucionFacade {
  constructor(private readonly repo: DistribucionRepository) {}

  getAgentes() {
    return this.repo.getAgentes();
  }

  getBodegas() {
    return this.repo.getBodegas();
  }

  async getMatriz() {
    const [agentes, bodegas, periodo] = await Promise.all([
      this.repo.getAgentes(),
      this.repo.getBodegas(),
      this.repo.getMesAnio(),
    ]);

    if (!periodo) {
      throw new BadRequestException(
        'No se pudo obtener el periodo de distribución',
      );
    }

    const registros = await this.repo.getAsignacionesPeriodo(
      periodo.mes,
      periodo.anio,
    );
    const registroMap = new Map(
      registros.map((r) => [`${r.agente}-${r.bodega}`, r.distribucion]),
    );

    const asignaciones = agentes.flatMap((agente) =>
      bodegas.map((bod) => {
        const bodega = Number(bod['bodega']);
        const key = `${agente.nit_real}-${bodega}`;
        const distribucion = registroMap.get(key);
        return {
          agente: agente.nit_real,
          nombres: agente.nombres,
          bodega,
          asignado: distribucion != null,
          distribucion: distribucion ?? null,
        };
      }),
    );

    return {
      mes: periodo.mes,
      anio: periodo.anio,
      agentes,
      bodegas,
      asignaciones,
    };
  }

  async getTotales() {
    const periodo = await this.repo.getMesAnio();
    if (!periodo) {
      throw new BadRequestException(
        'No se pudo obtener el periodo de distribución',
      );
    }
    return this.repo.cargarTotales(periodo.mes, periodo.anio);
  }

  async toggle(dto: ToggleDistribucionDto) {
    const periodo = await this.repo.getMesAnio();
    if (!periodo) {
      return { status: 'err', message: 'Periodo no disponible' };
    }

    const ok = dto.activo
      ? await this.repo.insertDistribucion(
          dto.agente,
          dto.bodega,
          periodo.mes,
          periodo.anio,
        )
      : await this.repo.deleteDistribucion(
          dto.agente,
          dto.bodega,
          periodo.mes,
          periodo.anio,
        );

    return { status: ok ? 'ok' : 'err' };
  }

  async updateDistribucion(dto: UpdateDistribucionDto) {
    const periodo = await this.repo.getMesAnio();
    if (!periodo) {
      return { status: 'err', message: 'Periodo no disponible' };
    }

    const actual =
      (await this.repo.getDistribucion(
        dto.agente,
        dto.bodega,
        periodo.mes,
        periodo.anio,
      )) ?? 0;
    const sumaBodega = await this.repo.validarSumaDistribucion(
      dto.bodega,
      periodo.mes,
      periodo.anio,
    );
    const nuevaSuma = sumaBodega - actual + dto.distribucion;

    if (nuevaSuma > 100) {
      return { status: 'err_sum' };
    }

    const ok = await this.repo.updateDistribucion(
      dto.agente,
      dto.bodega,
      periodo.mes,
      periodo.anio,
      dto.distribucion,
    );

    return { status: ok ? 'ok' : 'err' };
  }
}
