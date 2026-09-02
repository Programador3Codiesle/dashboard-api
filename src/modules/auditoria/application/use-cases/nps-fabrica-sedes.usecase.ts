import { BadRequestException, Injectable } from '@nestjs/common';
import { IAuditoriaRepository } from '../../domain/auditoria.repository';

const SEDES_NPS = ['giron', 'rosita', 'barranca', 'bocono', 'general'] as const;

@Injectable()
export class NpsFabricaSedesUseCase {
  constructor(private readonly repo: IAuditoriaRepository) {}

  async execute(fecha: string) {
    const [year, month] = (fecha || '').split('-').map(Number);
    if (!year || !month) {
      throw new BadRequestException('fecha YYYY-MM requerida');
    }

    const partes = await Promise.all(
      SEDES_NPS.map(async (sede) => {
        const [cals, det] = await Promise.all([
          this.repo.npsSedeCalificaciones(sede, year, month),
          this.repo.npsSedeDetalle(sede, year, month),
        ]);
        return {
          sede,
          calificacion: cals[0]?.calificacion
            ? Math.round(cals[0].calificacion * 100) / 100
            : 0,
          det,
        };
      }),
    );

    const calificaciones: Record<string, number> = {};
    const detalles = [];
    for (const p of partes) {
      calificaciones[p.sede] = p.calificacion;
      if (p.det) detalles.push(p.det);
    }
    return { calificaciones, detalles };
  }
}
