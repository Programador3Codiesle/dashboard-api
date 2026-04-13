import { Injectable } from '@nestjs/common';
import { RegistrarSalidaUseCase } from './use-cases/registrar-salida.usecase';
import { RegistrarLlegadaUseCase } from './use-cases/registrar-llegada.usecase';
import { ListarVehiculosUseCase } from './use-cases/listar-vehiculos.usecase';
import { RegistrarSalidaDto } from './dto/registrar-salida.dto';
import { RegistrarLlegadaDto } from './dto/registrar-llegada.dto';
import { FiltrosVehiculosDto } from './dto/filtros-vehiculos.dto';
import { VehiculosModelosUseCase } from './use-cases/vehiculos-modelos.use';

@Injectable()
export class ControlVehiculoFacade {
  constructor(
    private readonly registrarSalidaUC: RegistrarSalidaUseCase,
    private readonly registrarLlegadaUC: RegistrarLlegadaUseCase,
    private readonly listarVehiculosUC: ListarVehiculosUseCase,
    private readonly vehiculosModelosUC: VehiculosModelosUseCase,
  ) {}

  registrarSalida(dto: RegistrarSalidaDto, userId: number, perfil: number) {
    return this.registrarSalidaUC.execute(dto, userId, perfil);
  }

  registrarLlegada(id: number, dto: RegistrarLlegadaDto) {
    return this.registrarLlegadaUC.execute(id, dto);
  }

  listarVehiculos(perfil?: number) {
    return this.listarVehiculosUC.execute(perfil);
  }

  listarModelos() {
    return this.vehiculosModelosUC.execute();
  }
}
