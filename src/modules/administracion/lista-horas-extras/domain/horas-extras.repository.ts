import { HorasExtrasEntity } from './horas-extras.entity';

export abstract class IHorasExtrasRepository {
  abstract obtenerDiaActual(): Promise<HorasExtrasEntity[]>;
}
