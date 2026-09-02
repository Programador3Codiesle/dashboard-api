import { BadRequestException, Injectable } from '@nestjs/common';
import { IAuditoriaRepository } from '../../domain/auditoria.repository';
import { cumplimiento } from '../utils/cumplimiento';

@Injectable()
export class FacturacionTecnicoUseCase {
  constructor(private readonly repo: IAuditoriaRepository) {}

  async execute(bodega?: string, tecnico?: string) {
    if (!bodega && !tecnico) {
      throw new BadRequestException('Bodega o técnico requerido');
    }
    const rows = await this.repo.facturacionTecnico({
      bodega: bodega ? Number(bodega) : undefined,
      tecnico: tecnico || undefined,
    });
    return rows.map((r) => ({
      ...r,
      cumplimiento_rptos: cumplimiento(r.venta_rptos, r.presupuesto_rptos),
      cumplimiento_mo: cumplimiento(r.venta_mano_obra, r.presupuesto_mano_obra),
      cumplimiento_tot: cumplimiento(r.venta_tot, r.presupuesto_tot),
    }));
  }
}
