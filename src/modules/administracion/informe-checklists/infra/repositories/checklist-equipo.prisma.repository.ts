import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosChecklistEquipo,
  IChecklistEquipoRepository,
} from '../../domain/checklist-equipo.repository';
import { ChecklistEquipoEntity } from '../../domain/checklist-equipo.entity';

@Injectable()
export class ChecklistEquipoPrismaRepository implements IChecklistEquipoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(
    filtros: FiltrosChecklistEquipo,
  ): Promise<ChecklistEquipoEntity[]> {
    const tablas: Prisma.Sql[] = [
      Prisma.sql`swcrm_check_labor_calor`,
      Prisma.sql`swcrm_check_alineador`,
      Prisma.sql`swcrm_check_elevadores`,
      Prisma.sql`swcrm_check_tijera`,
      Prisma.sql`swcrm_check_hidraulicos`,
      Prisma.sql`swcrm_check_portico`,
      Prisma.sql`swcrm_check_cabina_pintura`,
    ];

    const indice = filtros.op ?? 0;
    const tabla = tablas[indice] ?? tablas[0];

    let sql: Prisma.Sql;

    if (filtros.idCheck != null && !Number.isNaN(filtros.idCheck)) {
      sql = Prisma.sql`
        SELECT *
        FROM ${tabla}
        WHERE id = ${filtros.idCheck}
      `;
    } else {
      const fechaIni = filtros.fechaIni ?? '';
      const fechaFin = filtros.fechaFin ?? '';

      sql = Prisma.sql`
        SELECT *
        FROM ${tabla}
        WHERE fecha BETWEEN ${fechaIni} AND ${fechaFin}
        ORDER BY fecha DESC
      `;
    }

    const rows = await this.prisma.$queryRaw<any[]>(sql);

    return rows.map((r) => new ChecklistEquipoEntity(r));
  }
}
