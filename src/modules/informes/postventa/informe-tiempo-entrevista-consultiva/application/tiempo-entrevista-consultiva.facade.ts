import { Injectable } from '@nestjs/common';
import { ObtenerResumenTiempoEntrevistaUseCase } from './use-cases/obtener-resumen-tiempo-entrevista.usecase';
import { ObtenerDetalleTiempoEntrevistaUseCase } from './use-cases/obtener-detalle-tiempo-entrevista.usecase';
import { FiltrosTiempoEntrevistaConsultiva } from '../domain/tiempo-entrevista-consultiva.repository';

@Injectable()
export class TiempoEntrevistaConsultivaFacade {
  constructor(
    private readonly obtenerResumenUseCase: ObtenerResumenTiempoEntrevistaUseCase,
    private readonly obtenerDetalleUseCase: ObtenerDetalleTiempoEntrevistaUseCase,
  ) {}

  obtenerResumen(filtros: FiltrosTiempoEntrevistaConsultiva) {
    return this.obtenerResumenUseCase.execute(filtros);
  }

  obtenerDetalle(bodega: number, filtros: FiltrosTiempoEntrevistaConsultiva) {
    return this.obtenerDetalleUseCase.execute(bodega, filtros);
  }
}

