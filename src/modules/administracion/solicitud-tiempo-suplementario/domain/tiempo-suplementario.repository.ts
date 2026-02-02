import { TiempoSuplementarioEntity } from './tiempo-suplementario.entity';

/** Datos para INSERT en postv_solicitud_hora_extra */
export interface CrearTiempoSuplementarioData {
    nit_jefe: number;
    nit_empleado: number;
    fecha_ini: Date;
    hora_ini?: string | null;
    hora_fin?: string | null;
    fecha_solicitud: Date;
    area: string;
    cargo?: string | null;
    sede?: string | null;
    descripcion: string;
    autorizacion?: number;
    autorizacionporteria?: number | null;
    id_empresa?: number | null;
}

export abstract class ITiempoSuplementarioRepository {
    abstract create(data: CrearTiempoSuplementarioData): Promise<{status: boolean, message: string, data?: TiempoSuplementarioEntity}>;
    abstract obtenerPorMes(mes: number, anio: number, nit_empleado: number): Promise<TiempoSuplementarioEntity[]>;
    abstract findById(id: number): Promise<TiempoSuplementarioEntity | null>;
    abstract actualizarAutorizacion(id: number, autorizacion: number): Promise<boolean>;
}
