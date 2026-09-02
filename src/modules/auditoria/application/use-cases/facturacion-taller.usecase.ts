import { BadRequestException, Injectable } from '@nestjs/common';
import { IAuditoriaRepository } from '../../domain/auditoria.repository';
import { cumplimiento } from '../utils/cumplimiento';

@Injectable()
export class FacturacionTallerUseCase {
  constructor(private readonly repo: IAuditoriaRepository) {}

  async execute(bodega: string) {
    if (!bodega) throw new BadRequestException('Bodega requerida');
    const rows = await this.repo.facturacionTaller(Number(bodega));
    return rows.map((r) => ({
      ...r,
      cumplimiento_rptos: cumplimiento(r.venta_rptos, r.presupuesto_rptos),
      cumplimiento_mo: cumplimiento(r.venta_mano_obra, r.presupuesto_mano_obra),
      cumplimiento_tot: cumplimiento(r.venta_tot, r.presupuesto_tot),
    }));
  }
}
