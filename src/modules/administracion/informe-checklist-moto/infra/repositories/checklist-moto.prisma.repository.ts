import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosChecklistMoto,
  IChecklistMotoRepository,
} from '../../domain/checklist-moto.repository';
import { ChecklistMotoEntity } from '../../domain/checklist-moto.entity';

@Injectable()
export class ChecklistMotoPrismaRepository implements IChecklistMotoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(
    filtros: FiltrosChecklistMoto,
  ): Promise<{ items: ChecklistMotoEntity[]; total: number }> {
    const conditions: Prisma.Sql[] = [];
    const pagina = filtros.pagina && filtros.pagina > 0 ? filtros.pagina : 1;
    const limite = filtros.limite && filtros.limite > 0 ? filtros.limite : 10;
    const offset = (pagina - 1) * limite;

    if (filtros.fechaIni && filtros.fechaFin) {
      conditions.push(
        Prisma.sql`fecha BETWEEN ${filtros.fechaIni} AND ${filtros.fechaFin}`,
      );
    } else {
      conditions.push(
        Prisma.sql`
          DATEPART(day, fecha) >= 1
          AND DATEPART(month, fecha) = DATEPART(month, GETDATE())
          AND DATEPART(year, fecha) = DATEPART(year, GETDATE())
        `,
      );
    }

    if (filtros.sede && filtros.sede !== '') {
      conditions.push(Prisma.sql`sede LIKE ${filtros.sede}`);
    }

    const where =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
        : Prisma.empty;

    const countSql = Prisma.sql`
      SELECT COUNT(1) AS total
      FROM swcrm_check_moto
      ${where}
    `;

    const dataSql = Prisma.sql`
      SELECT *
      FROM swcrm_check_moto
      ${where}
      ORDER BY fecha DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limite} ROWS ONLY
    `;

    const totalRows =
      await this.prisma.$queryRaw<Array<{ total: bigint | number }>>(countSql);
    const totalRaw = totalRows?.[0]?.total ?? 0;
    const total =
      typeof totalRaw === 'bigint' ? Number(totalRaw) : Number(totalRaw || 0);
    const rows = await this.prisma.$queryRaw<any[]>(dataSql);

    const items = rows.map(
      (r) =>
        new ChecklistMotoEntity({
          ...r,
          id: Number(r.id),
          fecha: r.fecha ? new Date(r.fecha).toISOString().split('T')[0] : '',
        }),
    );

    return { items, total };
  }
}
