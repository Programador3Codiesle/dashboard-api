import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosIndicadorChecklist,
  IIndicadorChecklistRepository,
} from '../../domain/indicador-checklist.repository';
import { IndicadorChecklistEntity } from '../../domain/indicador-checklist.entity';

@Injectable()
export class IndicadorChecklistPrismaRepository implements IIndicadorChecklistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(
    filtros: FiltrosIndicadorChecklist,
  ): Promise<IndicadorChecklistEntity[]> {
    const tablas = [
      'swcrm_check_labor_calor',
      'swcrm_check_alineador',
      'swcrm_check_elevadores',
      'swcrm_check_tijera',
      'swcrm_check_hidraulicos',
      'swcrm_check_portico',
    ];

    const indice = filtros.op ?? 0;
    const tabla = tablas[indice] ?? tablas[0];

    const conditions: Prisma.Sql[] = [];

    // Rango de fechas (obligatorio, igual que en legacy)
    conditions.push(
      Prisma.sql`fecha BETWEEN ${filtros.fechaIni} AND ${filtros.fechaFin}`,
    );

    // Filtro por sede (excepto "Todas")
    if (filtros.sede && filtros.sede !== 'Todas') {
      conditions.push(Prisma.sql`sede = ${filtros.sede}`);
    }

    const where =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
        : Prisma.empty;

    const sql = Prisma.sql`
      SELECT
        sede,
        COUNT(*) AS numRegistros
      FROM ${Prisma.raw(tabla)}
      ${where}
      GROUP BY sede
    `;

    const rows = await this.prisma.$queryRaw<any[]>(sql);

    return rows.map(
      (r) =>
        new IndicadorChecklistEntity({
          sede: r.sede ?? '',
          numRegistros:
            r.numRegistros !== undefined ? Number(r.numRegistros) : 0,
        }),
    );
  }
}
