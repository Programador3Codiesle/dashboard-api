import { InasistenciaEntity } from './inasistencia.entity';

export abstract class IInasistenciaRepository {
  abstract listar(filtros?: any): Promise<InasistenciaEntity[]>;
}
