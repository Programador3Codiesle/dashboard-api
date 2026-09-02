import { BadRequestException, Injectable } from '@nestjs/common';
import { IAuditoriaRepository } from '../../domain/auditoria.repository';
import { cumplimiento } from '../utils/cumplimiento';

@Injectable()
export class OrdenesMttoPreventivoUseCase {
  constructor(private readonly repo: IAuditoriaRepository) {}

  async execute(bodega: string) {
    if (!bodega) throw new BadRequestException('Bodega requerida');
    const rows = await this.repo.ordenesMttoPreventivo(Number(bodega));
    return rows.map((r) => ({
      ...r,
      cumplimiento: cumplimiento(r.cantidad_ot, r.presupuesto_ordenes),
    }));
  }
}
