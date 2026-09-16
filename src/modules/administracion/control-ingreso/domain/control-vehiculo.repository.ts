import { ControlVehiculoEntity } from './control-vehiculo.entity';

export type ControlVehiculoListRow = ControlVehiculoEntity & {
  modelo_descripcion?: string;
  empresa_nombre?: string;
  fecha_salida_fmt?: string;
  hora_salida_fmt?: string;
  fecha_llegada_fmt?: string | null;
  hora_llegada_fmt?: string | null;
};

export abstract class IControlVehiculoRepository {
  abstract registrarSalida(data: Partial<ControlVehiculoEntity>): Promise<{
    status: boolean;
    message: string;
    data?: ControlVehiculoEntity;
  }>;
  abstract registrarLlegada(
    id: number,
    km_llegada: bigint,
    idEmpresa: number,
    observacion?: string,
  ): Promise<{
    status: boolean;
    message: string;
    data?: ControlVehiculoEntity;
  }>;
  abstract listar(
    perfil: number | undefined,
    idEmpresa: number,
  ): Promise<ControlVehiculoListRow[]>;
  abstract findById(id: bigint): Promise<ControlVehiculoEntity | null>;
  abstract listarVehiculosModelos(): Promise<
    Array<{ id: number; descripcion: string }>
  >;
}
