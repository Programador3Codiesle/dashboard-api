import {
  CitaEntradaEntity,
  SedeUsuarioEntity,
  VhSinCitaEntity,
  VhSinOtEntity,
} from './entrada-vehiculo.entity';

export abstract class IEntradaVehiculoRepository {
  abstract getSedesUsuario(nitUsuario: number): Promise<SedeUsuarioEntity[]>;

  abstract getCitasEntradaVh(bodegaIds: number[]): Promise<CitaEntradaEntity[]>;
  abstract getCitasEntradaVhAtendidas(
    bodegaIds: number[],
  ): Promise<CitaEntradaEntity[]>;
  abstract getCitasEntradaVhPlaca(
    bodegaIds: number[],
    placa: string,
  ): Promise<CitaEntradaEntity[]>;
  abstract getCitasEntradaVhFecha(
    bodegaIds: number[],
    fecha: string,
  ): Promise<CitaEntradaEntity[]>;

  abstract getVhSinOt(bodegaIds: number[]): Promise<VhSinOtEntity[]>;
  abstract getVhSinOtPlaca(
    bodegaIds: number[],
    placa: string,
  ): Promise<VhSinOtEntity[]>;

  abstract getVhSinCita(bodegaIds: number[]): Promise<VhSinCitaEntity[]>;
  abstract getVhSinCitaPlaca(
    bodegaIds: number[],
    placa: string,
  ): Promise<VhSinCitaEntity[]>;

  abstract getCitaFechaHoraIni(idCita: number): Promise<Date | null>;
  abstract insertEntradaVh(idCita: number): Promise<boolean>;
  abstract insertVhSinCita(
    placa: string,
    cliente: string,
    motivo: string,
    bodega: number,
  ): Promise<boolean>;
}
