import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosChecklistPesv,
  IChecklistPesvRepository,
} from '../../domain/checklist-pesv.repository';
import { ChecklistPesvEntity } from '../../domain/checklist-pesv.entity';

@Injectable()
export class ChecklistPesvPrismaRepository implements IChecklistPesvRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(filtros: FiltrosChecklistPesv): Promise<ChecklistPesvEntity[]> {
    const tabla =
      filtros.tipo === 'carro'
        ? Prisma.sql`swcrm_check_carro`
        : Prisma.sql`swcrm_check_moto`;

    const whereConditions: Prisma.Sql[] = [
      Prisma.sql`fecha BETWEEN ${filtros.fechaIni} AND ${filtros.fechaFin}`,
    ];

    if (filtros.placa && filtros.placa.trim() !== '') {
      whereConditions.push(Prisma.sql`placa = ${filtros.placa.trim()}`);
    }

    const where =
      whereConditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(whereConditions, ' AND ')}`
        : Prisma.empty;

    const sql = Prisma.sql`
      SELECT placa, COUNT(*) AS numRegistros
      FROM ${tabla}
      ${where}
      GROUP BY placa
      ORDER BY placa
    `;

    const rows = await this.prisma.$queryRaw<any[]>(sql);

    return rows.map(
      (r) =>
        new ChecklistPesvEntity({
          placa: r.placa,
          numRegistros: Number(r.numRegistros),
        }),
    );
  }
}
