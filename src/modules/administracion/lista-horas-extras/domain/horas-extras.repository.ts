import { HorasExtrasEntity } from './horas-extras.entity';

export abstract class IHorasExtrasRepository {
  abstract obtenerDiaActual(sede: string): Promise<HorasExtrasEntity[]>;
}
