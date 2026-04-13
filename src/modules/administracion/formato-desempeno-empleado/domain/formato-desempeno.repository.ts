import { FormatoDesempenoEntity } from './formato-desempeno.entity';

export abstract class IFormatoDesempenoRepository {
  abstract create(data: Partial<FormatoDesempenoEntity>): Promise<{
    status: boolean;
    message: string;
    data?: FormatoDesempenoEntity;
  }>;
  abstract findById(id: bigint): Promise<{
    status: boolean;
    message: string;
    data?: FormatoDesempenoEntity;
  }>;
  abstract findByEmpleado(empleadoId: number): Promise<{
    status: boolean;
    message: string;
    data?: FormatoDesempenoEntity;
  }>;
}
