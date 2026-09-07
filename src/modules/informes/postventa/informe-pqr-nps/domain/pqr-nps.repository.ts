import {
  PqrNpsGestionEntity,
  PqrNpsItemEntity,
  PqrNpsTecnicoEntity,
  PqrNpsVehiculoInfoEntity,
  PqrNpsVerbalizacionEntity,
} from './pqr-nps.entity';
import type { PaginatedResult } from '../../../../../core/infra/pagination';

export interface FiltrosPqrNps {
  estado?: 'abiertos' | 'cerrados' | 'todos';
  pagina?: number;
  limite?: number;
  q?: string;
}

export interface ActualizarPqrNpsPayload {
  fuente: string;
  idFuente: number;
  postVenta: number;
  tecnico: string;
  tipificacionEncuesta: string;
  estadoCaso: string;
  comentariosFinalCaso: string;
  tipificacionCierre: string;
}

export interface CrearPqrPayload {
  fuente: string;
  sede: string;
  fecha: string;
  placa: string;
  cliente: string;
  modeloVh: string;
  orden: string;
  mail: string;
  telefono: string;
  tecnico: string;
  comentarios: string;
}

export interface CrearVerbalizacionPayload {
  idPqrNps: number;
  contacto: string;
  verbalizacion: string;
}

export abstract class IPqrNpsRepository {
  abstract listar(
    filtros: FiltrosPqrNps,
  ): Promise<PaginatedResult<PqrNpsItemEntity>>;

  abstract obtenerGestion(
    fuente: string,
    idFuente: number,
  ): Promise<PqrNpsGestionEntity | null>;

  abstract guardarGestion(payload: ActualizarPqrNpsPayload): Promise<void>;

  abstract crearPqr(payload: CrearPqrPayload): Promise<void>;

  abstract obtenerClientePorNit(nit: string): Promise<string | null>;

  abstract obtenerInfoVehiculo(
    placa: string,
  ): Promise<PqrNpsVehiculoInfoEntity | null>;

  abstract crearVerbalizacion(
    payload: CrearVerbalizacionPayload,
  ): Promise<void>;

  abstract listarVerbalizaciones(
    idPqrNps: number,
  ): Promise<PqrNpsVerbalizacionEntity[]>;

  abstract listarTecnicos(): Promise<PqrNpsTecnicoEntity[]>;
}
