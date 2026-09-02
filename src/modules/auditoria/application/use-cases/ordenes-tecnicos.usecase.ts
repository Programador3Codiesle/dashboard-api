import { BadRequestException, Injectable } from '@nestjs/common';
import { IAuditoriaRepository } from '../../domain/auditoria.repository';
import { cumplimiento } from '../utils/cumplimiento';

@Injectable()
export class OrdenesTecnicosUseCase {
  constructor(private readonly repo: IAuditoriaRepository) {}

  async execute(bodega?: string, tecnico?: string) {
    if (!bodega && !tecnico) {
      throw new BadRequestException('Bodega o técnico requerido');
    }
    const rows = await this.repo.ordenesTecnicos({
      bodega: bodega ? Number(bodega) : undefined,
      tecnico: tecnico || undefined,
    });
    return rows.map((r) => ({
      ...r,
      cumplimiento: cumplimiento(r.ordenes, r.presupuesto_ordenes),
    }));
  }
}
