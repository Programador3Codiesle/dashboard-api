import { InformeMttoPreventivoEntity } from './informe-mtto-preventivo.entity';

export abstract class IInformeMttoPreventivoRepository {
  abstract listar(): Promise<InformeMttoPreventivoEntity[]>;
  abstract obtenerHistorial(placa: string): Promise<any[]>;
}
