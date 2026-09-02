import { BadRequestException, Injectable } from '@nestjs/common';
import { IAuditoriaRepository } from '../../domain/auditoria.repository';

@Injectable()
export class EntregasUseCase {
  constructor(private readonly repo: IAuditoriaRepository) {}

  async execute(ano: number, tipo: number) {
    if (!ano || (tipo !== 1 && tipo !== 2)) {
      throw new BadRequestException('Año y tipo (1|2) son requeridos');
    }
    const tipoStr = tipo === 1 ? 'LIVIANOS' : 'PESADOS';
    const rows = await this.repo.entregas(ano, tipoStr);
    return rows.map((r) => ({
      ...r,
      promedio:
        r.entregas > 0
          ? Math.round((r.segunda_entrega / r.entregas) * 10000) / 100
          : 0,
    }));
  }
}
