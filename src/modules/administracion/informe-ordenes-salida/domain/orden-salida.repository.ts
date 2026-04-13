import { OrdenSalidaEntity } from './orden-salida.entity';

export interface FiltrosOrdenSalida {
  fechaIni?: string | null;
  fechaFin?: string | null;
  jefe?: string | null;
  area?: string | null;
  sede?: string | null;
  tipoSalida?: number | null;
  /** JWT `sub` -> id_usuario legacy */
  idUsuario?: number | null;
  /** JWT `nit` -> nit_user legacy */
  nitUsuario?: string | null;
  /** JWT `role` -> perfil_postventa legacy */
  perfil?: number | null;
}

export abstract class IOrdenSalidaRepository {
  abstract listar(filtros: FiltrosOrdenSalida): Promise<OrdenSalidaEntity[]>;
  abstract guardarObservacion(id: number, observacion: string): Promise<void>;
}
