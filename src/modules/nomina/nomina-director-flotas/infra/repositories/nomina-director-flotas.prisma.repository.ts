import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  FiltroNominaDirectorFlotas,
  INominaDirectorFlotasRepository,
} from '../../domain/nomina-director-flotas.repository';
import {
  NominaDirectorFlotasDetalleEntity,
  NominaDirectorFlotasPrincipalEntity,
} from '../../domain/nomina-director-flotas.entity';
import { Prisma } from '@prisma/client';

type RawPrincipal = {
  nit: number;
  nombres: string;
  placa: string;
  venta: number;
};

type RawDetalle = {
  nit: number;
  nombres: string;
};

@Injectable()
export class NominaDirectorFlotasPrismaRepository
  implements INominaDirectorFlotasRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async listarPrincipal(
    filtro: FiltroNominaDirectorFlotas,
  ): Promise<NominaDirectorFlotasPrincipalEntity[]> {
    const rows = await this.prisma.$queryRaw<RawPrincipal[]>(Prisma.sql`
      SELECT nit, nombres, placa, venta
      FROM v_placas_flotas_ingreso_taller
      WHERE comisiona = 1
        AND Año = ${filtro.ano}
        AND mes = ${filtro.mes}
    `);

    return rows.map(
      (row, index) =>
        new NominaDirectorFlotasPrincipalEntity({
          item: index + 1,
          nit: String(row.nit),
          nombres: row.nombres,
          placa: row.placa,
          venta: Number(row.venta ?? 0),
        }),
    );
  }

  async listarDetalle(
    filtro: FiltroNominaDirectorFlotas,
  ): Promise<NominaDirectorFlotasDetalleEntity[]> {
    const rows = await this.prisma.$queryRaw<RawDetalle[]>(Prisma.sql`
      SELECT DISTINCT f.nit, t.nombres
      FROM flotas_intranet f
      INNER JOIN terceros t ON f.nit = t.nit
      WHERE YEAR(fecha_asignacion) = ${filtro.ano}
        AND MONTH(fecha_asignacion) = ${filtro.mes}
      ORDER BY t.nombres ASC
    `);

    return rows.map(
      (row, index) =>
        new NominaDirectorFlotasDetalleEntity({
          item: index + 1,
          nit: String(row.nit),
          nombres: row.nombres,
        }),
    );
  }
}

