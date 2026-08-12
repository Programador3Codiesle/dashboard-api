import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { ITallaPersonalRepository } from '../../domain/talla-personal.repository';
import { TallaPersonalEntity } from '../../domain/talla-personal.entity';

@Injectable()
export class TallaPersonalPrismaRepository implements ITallaPersonalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(): Promise<TallaPersonalEntity[]> {
    const sql = Prisma.sql`
      SELECT *
      FROM v_inf_talla_dotacion
      ORDER BY nombre
    `;

    const rows = await this.prisma.$queryRaw<any[]>(sql);

    return rows.map(
      (r) =>
        new TallaPersonalEntity({
          nit: Number(r.nit),
          nombre: r.nombre ?? '',
          genero: Number(r.genero),
          talla_camisa: r.talla_camisa ?? null,
          talla_pantalon: r.talla_pantalon ?? null,
          talla_botas: r.talla_botas != null ? Number(r.talla_botas) : null,
        }),
    );
  }
}
