import { Injectable } from '@nestjs/common';
import { ListarPqrNpsUseCase } from './use-cases/listar-pqr-nps.usecase';
import {
  PqrNpsGestionEntity,
  PqrNpsItemEntity,
  PqrNpsTecnicoEntity,
  PqrNpsVehiculoInfoEntity,
  PqrNpsVerbalizacionEntity,
} from '../domain/pqr-nps.entity';
import {
  ActualizarPqrNpsPayload,
  CrearPqrPayload,
  CrearVerbalizacionPayload,
  FiltrosPqrNps,
} from '../domain/pqr-nps.repository';
import { ObtenerGestionPqrNpsUseCase } from './use-cases/obtener-gestion-pqr-nps.usecase';
import { GuardarGestionPqrNpsUseCase } from './use-cases/guardar-gestion-pqr-nps.usecase';
import { CrearPqrUseCase } from './use-cases/crear-pqr.usecase';
import { CrearVerbalizacionUseCase } from './use-cases/crear-verbalizacion.usecase';
import { ListarVerbalizacionesUseCase } from './use-cases/listar-verbalizaciones.usecase';
import { ObtenerClientePorNitUseCase } from './use-cases/obtener-cliente-por-nit.usecase';
import { ObtenerInfoVehiculoUseCase } from './use-cases/obtener-info-vehiculo.usecase';
import { ListarTecnicosPqrNpsUseCase } from './use-cases/listar-tecnicos-pqr-nps.usecase';

@Injectable()
export class PqrNpsFacade {
  constructor(
    private readonly listarPqrNps: ListarPqrNpsUseCase,
    private readonly obtenerGestionPqrNps: ObtenerGestionPqrNpsUseCase,
    private readonly guardarGestionPqrNps: GuardarGestionPqrNpsUseCase,
    private readonly crearPqrUseCase: CrearPqrUseCase,
    private readonly crearVerbalizacionUseCase: CrearVerbalizacionUseCase,
    private readonly listarVerbalizacionesUseCase: ListarVerbalizacionesUseCase,
    private readonly obtenerClientePorNitUseCase: ObtenerClientePorNitUseCase,
    private readonly obtenerInfoVehiculoUseCase: ObtenerInfoVehiculoUseCase,
    private readonly listarTecnicosUseCase: ListarTecnicosPqrNpsUseCase,
  ) {}

  listar(filtros: FiltrosPqrNps): Promise<PqrNpsItemEntity[]> {
    return this.listarPqrNps.execute(filtros);
  }

  obtenerGestion(
    fuente: string,
    idFuente: number,
  ): Promise<PqrNpsGestionEntity | null> {
    return this.obtenerGestionPqrNps.execute(fuente, idFuente);
  }

  guardarGestion(payload: ActualizarPqrNpsPayload): Promise<void> {
    return this.guardarGestionPqrNps.execute(payload);
  }

  crearPqr(payload: CrearPqrPayload): Promise<void> {
    return this.crearPqrUseCase.execute(payload);
  }

  crearVerbalizacion(payload: CrearVerbalizacionPayload): Promise<void> {
    return this.crearVerbalizacionUseCase.execute(payload);
  }

  listarVerbalizaciones(
    idPqrNps: number,
  ): Promise<PqrNpsVerbalizacionEntity[]> {
    return this.listarVerbalizacionesUseCase.execute(idPqrNps);
  }

  obtenerClientePorNit(nit: string): Promise<string | null> {
    return this.obtenerClientePorNitUseCase.execute(nit);
  }

  obtenerInfoVehiculo(placa: string): Promise<PqrNpsVehiculoInfoEntity | null> {
    return this.obtenerInfoVehiculoUseCase.execute(placa);
  }

  listarTecnicos(): Promise<PqrNpsTecnicoEntity[]> {
    return this.listarTecnicosUseCase.execute();
  }
}
