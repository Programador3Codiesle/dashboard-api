import { Injectable } from '@nestjs/common';
import { ObtenerPanelUseCase, ObtenerCitasProgramadasFechaUseCase } from './use-cases/obtener-panel.usecase';
import { MarcarEntradaUseCase } from './use-cases/marcar-entrada.usecase';
import { RegistrarVehiculoSinCitaUseCase } from './use-cases/registrar-vehiculo-sin-cita.usecase';
import { VehiculoSinCitaDto } from './dto/entrada-vehiculo.dto';

@Injectable()
export class EntradaVehiculoFacade {
  constructor(
    private readonly obtenerPanelUseCase: ObtenerPanelUseCase,
    private readonly obtenerCitasProgramadasFechaUseCase: ObtenerCitasProgramadasFechaUseCase,
    private readonly marcarEntradaUseCase: MarcarEntradaUseCase,
    private readonly registrarVehiculoSinCitaUseCase: RegistrarVehiculoSinCitaUseCase,
  ) {}

  obtenerPanel(nitUsuario: number, placa?: string) {
    return this.obtenerPanelUseCase.execute(nitUsuario, placa);
  }

  obtenerCitasProgramadasFecha(nitUsuario: number, fecha: string) {
    return this.obtenerCitasProgramadasFechaUseCase.execute(nitUsuario, fecha);
  }

  marcarEntrada(idCita: number) {
    return this.marcarEntradaUseCase.execute(idCita);
  }

  registrarVehiculoSinCita(nitUsuario: number, dto: VehiculoSinCitaDto) {
    return this.registrarVehiculoSinCitaUseCase.execute(
      nitUsuario,
      dto.placa,
      dto.cliente,
      dto.motivo,
      dto.bodega,
    );
  }
}
