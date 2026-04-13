import { Injectable } from '@nestjs/common';
import { BuscarOrdenSalidaUseCase } from './use-cases/buscar-orden-salida.usecase';
import { CrearOrdenSalidaUseCase } from './use-cases/crear-orden-salida.usecase';
import { ObtenerTiposSalidaUseCase } from './use-cases/obtener-tipos-salida.usecase';
import { CrearOrdenSalidaDto } from './dto/crear-orden-salida.dto';

@Injectable()
export class OrdenSalidaFacade {
  constructor(
    private readonly buscarOrdenUC: BuscarOrdenSalidaUseCase,
    private readonly crearOrdenUC: CrearOrdenSalidaUseCase,
    private readonly obtenerTiposSalidaUC: ObtenerTiposSalidaUseCase,
  ) {}

  /**
   * Búsqueda por placa (se mantiene por compatibilidad, aunque la opción B
   * se centra en la creación del formato).
   */
  buscarPorPlaca(placa: string) {
    return this.buscarOrdenUC.execute(placa);
  }

  obtenerTiposSalida(nitJefe: number) {
    const data = this.obtenerTiposSalidaUC.execute(nitJefe);
    return {
      status: true,
      message: 'Tipos de salida obtenidos correctamente',
      data,
    };
  }

  crearOrdenSalida(userNit: number, dto: CrearOrdenSalidaDto) {
    return this.crearOrdenUC.execute(userNit, dto);
  }
}
