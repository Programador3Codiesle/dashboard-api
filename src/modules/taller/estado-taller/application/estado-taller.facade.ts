import { Injectable } from '@nestjs/common';
import {
  AgregarEventoDto,
  FacturaMesActualDto,
  ValoresEstimadosDto,
} from './dto/estado-taller.dto';
import {
  AgregarEventoOtUseCase,
  GuardarFacturaMesActualUseCase,
  GuardarValoresEstimadosUseCase,
} from './use-cases/mutaciones-estado-taller.usecase';
import {
  ObtenerCotizacionesSacyrUseCase,
  ObtenerEstadosCatalogoUseCase,
  ObtenerHistorialOtUseCase,
  ObtenerPanelEstadoTallerUseCase,
  ObtenerTotalAbiertasUseCase,
} from './use-cases/obtener-estado-taller.usecase';

@Injectable()
export class EstadoTallerFacade {
  constructor(
    private readonly obtenerPanelUseCase: ObtenerPanelEstadoTallerUseCase,
    private readonly obtenerTotalAbiertasUseCase: ObtenerTotalAbiertasUseCase,
    private readonly obtenerEstadosCatalogoUseCase: ObtenerEstadosCatalogoUseCase,
    private readonly obtenerHistorialOtUseCase: ObtenerHistorialOtUseCase,
    private readonly obtenerCotizacionesSacyrUseCase: ObtenerCotizacionesSacyrUseCase,
    private readonly agregarEventoOtUseCase: AgregarEventoOtUseCase,
    private readonly guardarFacturaMesActualUseCase: GuardarFacturaMesActualUseCase,
    private readonly guardarValoresEstimadosUseCase: GuardarValoresEstimadosUseCase,
  ) {}

  obtenerPanel(nitUsuario: number, bodega?: string, idEmpresa?: number) {
    return this.obtenerPanelUseCase.execute(nitUsuario, bodega, idEmpresa);
  }

  obtenerTotalAbiertas(nitUsuario: number, bodega?: string, idEmpresa?: number) {
    return this.obtenerTotalAbiertasUseCase.execute(
      nitUsuario,
      bodega,
      idEmpresa,
    );
  }

  obtenerEstadosCatalogo() {
    return this.obtenerEstadosCatalogoUseCase.execute();
  }

  obtenerHistorial(numeroOrden: number) {
    return this.obtenerHistorialOtUseCase.execute(numeroOrden);
  }

  obtenerCotizacionesSacyr(numeroOrden: number) {
    return this.obtenerCotizacionesSacyrUseCase.execute(numeroOrden);
  }

  agregarEvento(dto: AgregarEventoDto) {
    return this.agregarEventoOtUseCase.execute(dto);
  }

  guardarFacturaMesActual(userId: number, dto: FacturaMesActualDto) {
    return this.guardarFacturaMesActualUseCase.execute(userId, dto);
  }

  guardarValoresEstimados(userId: number, dto: ValoresEstimadosDto) {
    return this.guardarValoresEstimadosUseCase.execute(userId, dto);
  }
}
