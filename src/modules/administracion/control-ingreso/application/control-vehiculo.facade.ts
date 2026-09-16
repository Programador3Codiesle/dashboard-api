import { Injectable } from '@nestjs/common';
import { RegistrarSalidaUseCase } from './use-cases/registrar-salida.usecase';
import { RegistrarLlegadaUseCase } from './use-cases/registrar-llegada.usecase';
import { ListarVehiculosUseCase } from './use-cases/listar-vehiculos.usecase';
import { RegistrarSalidaDto } from './dto/registrar-salida.dto';
import { RegistrarLlegadaDto } from './dto/registrar-llegada.dto';
import { VehiculosModelosUseCase } from './use-cases/vehiculos-modelos.use';

@Injectable()
export class ControlVehiculoFacade {
  constructor(
    private readonly registrarSalidaUC: RegistrarSalidaUseCase,
    private readonly registrarLlegadaUC: RegistrarLlegadaUseCase,
    private readonly listarVehiculosUC: ListarVehiculosUseCase,
    private readonly vehiculosModelosUC: VehiculosModelosUseCase,
  ) {}

  registrarSalida(
    dto: RegistrarSalidaDto,
    userId: number,
    perfil: number,
    idEmpresa: number,
  ) {
    return this.registrarSalidaUC.execute(dto, userId, perfil, idEmpresa);
  }

  registrarLlegada(id: number, dto: RegistrarLlegadaDto, idEmpresa: number) {
    return this.registrarLlegadaUC.execute(id, dto, idEmpresa);
  }

  listarVehiculos(perfil: number | undefined, idEmpresa: number) {
    return this.listarVehiculosUC.execute(perfil, idEmpresa);
  }

  listarModelos() {
    return this.vehiculosModelosUC.execute();
  }
}
