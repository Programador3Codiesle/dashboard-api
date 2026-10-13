import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import { clampPageLimit } from '../../../../../../core/infra/pagination';
import type { PaginatedResult } from '../../../../../../core/infra/pagination';
import type { InformeLead } from '../../domain/informe-leads.entity';
import {
  FiltrosInformeLeads,
  IInformeLeadsRepository,
} from '../../domain/informe-leads.repository';

type FilaLead = {
  fecha_registro: Date | string;
  nombres: string | null;
  placa: string | null;
  telefonos: string | null;
  email: string | null;
  campana: string | null;
  motivo: string | null;
  idcita: bigint | number | string | null;
};

function texto(
  value: string | number | bigint | null | undefined,
): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text === '' ? null : text;
}

/** DATE de SQL Server llega como medianoche UTC. Se muestra el día guardado. */
function fechaRegistro(value: Date | string): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function mapFila(fila: FilaLead): InformeLead {
  return {
    fechaRegistro: fechaRegistro(fila.fecha_registro),
    nombres: texto(fila.nombres),
    placa: texto(fila.placa),
    telefonos: texto(fila.telefonos),
    email: texto(fila.email),
    campana: texto(fila.campana),
    motivo: texto(fila.motivo),
    idCita: texto(fila.idcita),
  };
}

const SELECT_LEAD = Prisma.sql`
  fecha_registro,
  nombres,
  placa,
  telefonos,
  email,
  [campaña] AS campana,
  motivo,
  idcita
`;

function whereRango(desde: string, hasta: string) {
  return Prisma.sql`
    CONVERT(DATE, fecha_registro) >= CONVERT(DATE, ${desde})
    AND CONVERT(DATE, fecha_registro) <= CONVERT(DATE, ${hasta})
  `;
}

@Injectable()
export class InformeLeadsPrismaRepository implements IInformeLeadsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(
    filtros: FiltrosInformeLeads,
  ): Promise<PaginatedResult<InformeLead>> {
    const { pagina, limite, offset } = clampPageLimit(
      filtros.pagina,
      filtros.limite,
      10,
      100,
    );
    const [conteo] = await this.prisma.$queryRaw<{ total: number }[]>(
      Prisma.sql`
        SELECT COUNT(*) AS total
        FROM v_gestion_leads_posventa
        WHERE ${whereRango(filtros.desde, filtros.hasta)}
      `,
    );

    const filas = await this.prisma.$queryRaw<FilaLead[]>(Prisma.sql`
      SELECT ${SELECT_LEAD}
      FROM v_gestion_leads_posventa
      WHERE ${whereRango(filtros.desde, filtros.hasta)}
      ORDER BY fecha_registro DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limite} ROWS ONLY
    `);

    return {
      items: filas.map(mapFila),
      total: Number(conteo?.total ?? 0),
      pagina,
      limite,
    };
  }

  async listarRango(desde: string, hasta: string): Promise<InformeLead[]> {
    const filas = await this.prisma.$queryRaw<FilaLead[]>(Prisma.sql`
      SELECT ${SELECT_LEAD}
      FROM v_gestion_leads_posventa
      WHERE ${whereRango(desde, hasta)}
      ORDER BY fecha_registro DESC
    `);
    return filas.map(mapFila);
  }
}
