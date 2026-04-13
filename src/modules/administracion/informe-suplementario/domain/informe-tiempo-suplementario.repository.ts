import { InformeTiempoSuplementarioEntity } from './informe-tiempo-suplementario.entity';

export abstract class IInformeTiempoSuplementarioRepository {
  abstract listar(filtros?: any): Promise<InformeTiempoSuplementarioEntity[]>;
}
