import { FormatoNominaEntity } from './formato-nomina.entity';

export abstract class IFormatoNominaRepository {
  abstract obtenerFormatos(): Promise<FormatoNominaEntity[]>;
  abstract obtenerRutaArchivo(id: number): Promise<string | null>;
}
