import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosInformeHorario,
  IInformeHorarioRepository,
} from '../../domain/informe-horario.repository';
import { InformeHorarioEntity } from '../../domain/informe-horario.entity';

function soloFechaSql(s: string): string {
  const t = String(s ?? '').trim();
  const m = t.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : t.slice(0, 10);
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

@Injectable()
export class InformeHorarioPrismaRepository implements IInformeHorarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(params: FiltrosInformeHorario): Promise<InformeHorarioEntity[]> {
    const fechaIni = soloFechaSql(params.fechaIni);
    const fechaFin = soloFechaSql(params.fechaFin);
    const sede = params.sede?.trim() || null;
    const empleadoRaw = params.empleado?.trim() || null;
    const empleado =
      empleadoRaw != null && Number.isFinite(Number(empleadoRaw))
        ? Number(empleadoRaw)
        : null;

    const sql = Prisma.sql`
      EXEC sp_Reporte_ingreso_empleados
        @fechaIni = ${fechaIni},
        @fechaFin = ${fechaFin}
        ${sede ? Prisma.sql`, @Sede = ${sede}` : Prisma.empty}
        ${empleado != null ? Prisma.sql`, @empleado = ${empleado}` : Prisma.empty}
    `;

    const rows = await this.prisma.$queryRaw<any[]>(sql);

    return rows.map(
      (r) =>
        new InformeHorarioEntity({
          empleado: r.empleado ? String(r.empleado) : '',
          nombres: r.nombres ?? '',
          sede: r.Sede ?? r.sede ?? '',
          dia: r.Dia ?? r.dia ?? '',
          fecha: r.fecha ? new Date(r.fecha) : new Date(),
          horario_entrada_am: r.horario_entrada_am ?? null,
          horario_salida_am: r.horario_salida_am ?? null,
          horario_entrada_pm: r.horario_entrada_pm ?? null,
          horario_salida_pm: r.horario_salida_pm ?? null,
          inicio_ausentismo: r.inicio_ausentismo ?? null,
          fin_ausentismo: r.fin_ausentismo ?? null,
          llegada_am: r.llegada_am ?? null,
          salida_am: r.salida_am ?? null,
          llegada_pm: r.llegada_pm ?? null,
          salida_pm: r.salida_pm ?? null,
          dif_entrada_am: toNumberOrNull(r.dif_entrada_am),
          dif_salida_am: toNumberOrNull(r.dif_salida_am),
          dif_entrada_pm: toNumberOrNull(r.dif_entrada_pm),
          dif_salida_pm: toNumberOrNull(r.dif_salida_pm),
        }),
    );
  }
}
