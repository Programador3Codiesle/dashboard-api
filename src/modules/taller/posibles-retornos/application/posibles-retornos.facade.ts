import { Injectable } from '@nestjs/common';
import { CerrarBdcDto } from './dto/cerrar-bdc.dto';
import { DetallePlacaDto } from './dto/detalle-placa.dto';
import { GuardarDefinicionDto } from './dto/guardar-definicion.dto';
import { ListarPosiblesRetornosDto } from './dto/listar-posibles-retornos.dto';
import { SolucionOrdenDto } from './dto/solucion-orden.dto';
import { CerrarBdcUseCase } from './use-cases/cerrar-bdc.use-case';
import { GuardarDefinicionUseCase } from './use-cases/guardar-definicion.use-case';
import { ListarPosiblesRetornosUseCase } from './use-cases/listar-posibles-retornos.use-case';
import { ObtenerCatalogosUseCase } from './use-cases/obtener-catalogos.use-case';
import { ObtenerDetallePlacaUseCase } from './use-cases/obtener-detalle-placa.use-case';
import { ObtenerSolucionUseCase } from './use-cases/obtener-solucion.use-case';

@Injectable()
export class PosiblesRetornosFacade {
  constructor(
    private readonly obtenerCatalogosUseCase: ObtenerCatalogosUseCase,
    private readonly listarPosiblesRetornosUseCase: ListarPosiblesRetornosUseCase,
    private readonly obtenerDetallePlacaUseCase: ObtenerDetallePlacaUseCase,
    private readonly guardarDefinicionUseCase: GuardarDefinicionUseCase,
    private readonly obtenerSolucionUseCase: ObtenerSolucionUseCase,
    private readonly cerrarBdcUseCase: CerrarBdcUseCase,
  ) {}

  obtenerCatalogos() {
    return this.obtenerCatalogosUseCase.execute();
  }

  listar(dto: ListarPosiblesRetornosDto) {
    return this.listarPosiblesRetornosUseCase.execute(dto);
  }

  obtenerDetalle(dto: DetallePlacaDto) {
    return this.obtenerDetallePlacaUseCase.execute(dto);
  }

  guardarDefinicion(dto: GuardarDefinicionDto, usuario: string) {
    return this.guardarDefinicionUseCase.execute(dto, usuario);
  }

  obtenerSolucion(dto: SolucionOrdenDto) {
    return this.obtenerSolucionUseCase.execute(dto);
  }

  cerrarBdc(dto: CerrarBdcDto, usuario: string) {
    return this.cerrarBdcUseCase.execute(dto, usuario);
  }
}
