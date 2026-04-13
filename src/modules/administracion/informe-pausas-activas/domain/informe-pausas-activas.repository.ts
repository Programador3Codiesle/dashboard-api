import { InformePausasActivasEntity } from './informe-pausas-activas.entity';

export abstract class IInformePausasActivasRepository {
  abstract listar(params: {
    empleado?: string | null;
    sede?: string | null;
    fechaDia?: string | null;
    fechaMes?: string | null;
  }): Promise<InformePausasActivasEntity[]>;
}
