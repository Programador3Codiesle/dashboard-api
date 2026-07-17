import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  AUDITORIA_REPOSITORY,
  type AuditoriaRepository,
} from '../domain/auditoria.repository';

function cumplimiento(venta: number, presupuesto: number): number {
  if (!venta) return 0;
  const den = presupuesto === 0 ? venta : presupuesto;
  return Math.round((venta / den) * 10000) / 100;
}

const SEDES_NPS = ['giron', 'rosita', 'barranca', 'bocono', 'general'] as const;
const SEDES_TEC = ['giron', 'rosita', 'barranca', 'bocono'] as const;

@Injectable()
export class AuditoriaFacade {
  constructor(
    @Inject(AUDITORIA_REPOSITORY)
    private readonly repo: AuditoriaRepository,
  ) {}

  async ordenesDiarias(fecha: string, bodega: string) {
    if (!fecha || !bodega) {
      throw new BadRequestException('Fecha y bodega son requeridos');
    }
    const [y, m, d] = fecha.split('-').map(Number);
    if (!y || !m || !d) throw new BadRequestException('Fecha inválida');
    return this.repo.ordenesDiarias(y, m, d, Number(bodega));
  }

  async entregas(ano: number, tipo: number) {
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

  async facturacionTaller(bodega: string) {
    if (!bodega) throw new BadRequestException('Bodega requerida');
    const rows = await this.repo.facturacionTaller(Number(bodega));
    return rows.map((r) => ({
      ...r,
      cumplimiento_rptos: cumplimiento(r.venta_rptos, r.presupuesto_rptos),
      cumplimiento_mo: cumplimiento(
        r.venta_mano_obra,
        r.presupuesto_mano_obra,
      ),
      cumplimiento_tot: cumplimiento(r.venta_tot, r.presupuesto_tot),
    }));
  }

  async facturacionTecnico(bodega?: string, tecnico?: string) {
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
      cumplimiento_mo: cumplimiento(
        r.venta_mano_obra,
        r.presupuesto_mano_obra,
      ),
      cumplimiento_tot: cumplimiento(r.venta_tot, r.presupuesto_tot),
    }));
  }

  async ordenesMttoPreventivo(bodega: string) {
    if (!bodega) throw new BadRequestException('Bodega requerida');
    const rows = await this.repo.ordenesMttoPreventivo(Number(bodega));
    return rows.map((r) => ({
      ...r,
      cumplimiento: cumplimiento(r.cantidad_ot, r.presupuesto_ordenes),
    }));
  }

  async ordenesTecnicos(bodega?: string, tecnico?: string) {
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

  listarTecnicos() {
    return this.repo.listarTecnicos();
  }

  async npsFabricaSedes(fecha: string) {
    const [year, month] = (fecha || '').split('-').map(Number);
    if (!year || !month) throw new BadRequestException('fecha YYYY-MM requerida');

    const calificaciones: Record<string, number> = {};
    const detalles = [];

    for (const sede of SEDES_NPS) {
      const cals = await this.repo.npsSedeCalificaciones(sede, year, month);
      calificaciones[sede] = cals[0]?.calificacion
        ? Math.round(cals[0].calificacion * 100) / 100
        : 0;
      const det = await this.repo.npsSedeDetalle(sede, year, month);
      if (det) detalles.push(det);
    }

    return { calificaciones, detalles };
  }

  async npsFabricaTecnicos(fecha: string, sede?: string) {
    const [year, month] = (fecha || '').split('-').map(Number);
    if (!year || !month) throw new BadRequestException('fecha YYYY-MM requerida');

    const sedes = sede
      ? SEDES_TEC.filter((s) => s === sede)
      : [...SEDES_TEC];

    if (sede && sedes.length === 0) {
      throw new BadRequestException('Sede inválida');
    }

    const result: Record<
      string,
      { agregado: { enc06: number; enc78: number; enc910: number }; detalle: Awaited<ReturnType<AuditoriaRepository['npsTecnicoDetalle']>> }
    > = {};

    for (const s of sedes) {
      const agregado = await this.repo.npsTecnicoAgregado(s, year, month);
      const detalle = await this.repo.npsTecnicoDetalle(s, year, month);
      result[s] = { agregado, detalle };
    }
    return result;
  }
}
