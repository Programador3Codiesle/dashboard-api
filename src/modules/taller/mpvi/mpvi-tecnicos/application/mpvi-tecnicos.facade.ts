import { Injectable } from '@nestjs/common';
import { ObtenerItemsUseCase } from './use-cases/obtener-items.usecase';
import { ObtenerDatosUseCase } from './use-cases/obtener-datos.usecase';
import { ObtenerStockUseCase } from './use-cases/obtener-stock.usecase';
import { GuardarDatosUseCase } from './use-cases/guardar-datos.usecase';
import { ImprimirMpviUseCase } from './use-cases/imprimir-mpvi.usecase';
import type {
  GuardarDatosDto,
  ObtenerDatosDto,
  ObtenerItemsDto,
  ObtenerStockDto,
} from './dto/mpvi-tecnicos.dto';

@Injectable()
export class MpviTecnicosFacade {
  constructor(
    private readonly obtenerItemsUC: ObtenerItemsUseCase,
    private readonly obtenerDatosUC: ObtenerDatosUseCase,
    private readonly obtenerStockUC: ObtenerStockUseCase,
    private readonly guardarDatosUC: GuardarDatosUseCase,
    private readonly imprimirMpviUC: ImprimirMpviUseCase,
  ) {}

  obtenerItems(dto: ObtenerItemsDto) {
    return this.obtenerItemsUC.execute(dto.placa);
  }

  obtenerDatos(dto: ObtenerDatosDto) {
    return this.obtenerDatosUC.execute(dto);
  }

  obtenerStock(dto: ObtenerStockDto) {
    return this.obtenerStockUC.execute(dto.codRepuesto);
  }

  guardarDatos(dto: GuardarDatosDto, idUser: number) {
    return this.guardarDatosUC.execute(dto, idUser);
  }

  imprimirMpvi(idCotizacion: number, idEmpresa?: number) {
    return this.imprimirMpviUC.execute(idCotizacion, idEmpresa);
  }
}
