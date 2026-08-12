import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosLlegadasTarde,
  ILlegadasTardeRepository,
  ResumenLlegadasTarde,
} from '../../domain/llegadas-tarde.repository';
import { LlegadaTardeEntity } from '../../domain/llegada-tarde.entity';

/** Evita cadenas ISO con zona horaria u hora que SQL Server no asigna bien a variables date. */
function soloFechaSql(s: string): string {
  const t = String(s).trim();
  const m = t.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : t.slice(0, 10);
}

@Injectable()
export class LlegadasTardePrismaRepository implements ILlegadasTardeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(filtros: FiltrosLlegadasTarde): Promise<LlegadaTardeEntity[]> {
    const { sede, empleado } = filtros;
    const fechaInicio = soloFechaSql(filtros.fechaInicio);
    const fechaFin = soloFechaSql(filtros.fechaFin);

    const sql = Prisma.sql`
      EXEC dbo.sp_Reporte_Diferencias_Horarios
        @fecha_ini = ${fechaInicio},
        @fecha_fin = ${fechaFin}
    `;

    const rows = await this.prisma.$queryRaw<any[]>(sql);

    return rows
      .filter((r) => {
        if (sede && r.sede !== sede) return false;
        if (empleado != null && Number(r.empleado) !== Number(empleado)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const sedeCmp = String(a.sede ?? '').localeCompare(String(b.sede ?? ''));
        if (sedeCmp !== 0) return sedeCmp;
        const empCmp = Number(a.empleado) - Number(b.empleado);
        if (empCmp !== 0) return empCmp;
        return String(a.fecha ?? '').localeCompare(String(b.fecha ?? ''));
      })
      .map(
        (r) =>
          new LlegadaTardeEntity({
            empleado: Number(r.empleado),
            nombres: r.nombres,
            sede: r.sede,
            fecha: r.fecha,
            llegada_am: r.llegada_am,
            llegada_pm: r.llegada_pm,
            inicio_ausentismo: r.inicio_ausentismo,
            fin_ausentismo: r.fin_ausentismo,
            dif_entrada_am: Number(r.dif_entrada_am ?? 0),
            dif_entrada_pm: Number(r.dif_entrada_pm ?? 0),
          }),
      );
  }

  async listarResumen(
    fechaInicio: string,
    fechaFin: string,
  ): Promise<ResumenLlegadasTarde[]> {
    const fi = soloFechaSql(fechaInicio);
    const ff = soloFechaSql(fechaFin);
    const sql = Prisma.sql`
      SELECT l.nit,
             t.nombres,
             SUM(l.minutospordia) AS total_minutos
      FROM llegadas_tarde l
      INNER JOIN terceros t
        ON l.nit = t.nit
      WHERE l.Fecha >= ${fi}
        AND l.Fecha <= ${ff}
      GROUP BY l.nit, t.nombres
      ORDER BY t.nombres
    `;

    const rows = await this.prisma.$queryRaw<any[]>(sql);

    return rows.map((r) => ({
      nit: Number(r.nit),
      nombres: r.nombres,
      totalMinutosTarde: Number(r.total_minutos),
    }));
  }
}
