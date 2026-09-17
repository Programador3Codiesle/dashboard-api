import { NuevoAusentismoEntity } from './nuevo-ausentismo.entity';

export abstract class INuevoAusentismoRepository {
  abstract create(data: Partial<NuevoAusentismoEntity>): Promise<{
    status: boolean;
    message: string;
    data?: NuevoAusentismoEntity;
  }>;
  abstract obtenerPorMes(
    mes: number,
    anio: number,
    empleado: number,
  ): Promise<NuevoAusentismoEntity[]>;
  abstract findById(id: bigint): Promise<NuevoAusentismoEntity | null>;
  abstract actualizarAutorizacion(
    id: bigint,
    autorizacion: number,
  ): Promise<boolean>;
  abstract datosCorreoCreacion(nitEmpleado: number): Promise<{
    nombre: string;
    correosJefes: string[];
  }>;
  abstract minutosBancoTiempo(): Promise<number>;
  abstract minutosAusentismosPersonalesAnio(
    nitEmpleado: number,
  ): Promise<number>;
  abstract esDiaHabil(fechaYmd: string): Promise<boolean>;
  abstract insertarRecuperacion(
    idAusentismo: bigint,
    tramos: Array<{ fecha: string; hora_ini: string; hora_fin: string }>,
  ): Promise<void>;
  abstract listarRecuperacion(
    idAusentismo: bigint,
  ): Promise<Array<{ fecha: string; hora_ini: string; hora_fin: string }>>;
}
