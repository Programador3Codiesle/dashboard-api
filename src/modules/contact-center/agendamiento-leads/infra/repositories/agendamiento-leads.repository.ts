import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { ListarLeadsDto } from '../../application/dto/agendamiento-leads.dto';

@Injectable()
export class AgendamientoLeadsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getLeads(filtros: ListarLeadsDto): Promise<Record<string, unknown>[]> {
    const tipoLeads = filtros.tipoLeads ?? '';
    let where = '';
    let camposGestionados = '';
    let innerGestionados = '';

    if (tipoLeads === '0') {
      where = 'WHERE p.idagente IS NOT NULL';
    } else if (tipoLeads === '3') {
      camposGestionados =
        ', c.interesado, c.idcita, m.motivo, convert(varchar, c.fecha_reg, 23) as fecha_gestionado';
      innerGestionados =
        'INNER JOIN swcc_postventa_citas c ON c.idcontactlead = p.idcontactlead INNER JOIN swcc_postventa_motivos m ON m.id = c.motivo';
    } else if (tipoLeads === '1') {
      where = 'WHERE p.idagente IS NULL';
    }

    let entreFechas = Prisma.empty;
    if (filtros.fecha_ini) {
      const fin = filtros.fecha_fin ?? filtros.fecha_ini;
      entreFechas = where
        ? Prisma.sql`AND p.fechahora_ing >= ${filtros.fecha_ini} AND p.fechahora_ing < DATEADD(day, 1, CAST(${fin} AS DATE))`
        : Prisma.sql`WHERE p.fechahora_ing >= ${filtros.fecha_ini} AND p.fechahora_ing < DATEADD(day, 1, CAST(${fin} AS DATE))`;
    }

    return this.prisma.$queryRaw<Record<string, unknown>[]>(Prisma.sql`
      SELECT p.*, l.nombre as lead, a.agencia, convert(varchar, p.fechahora_ing, 23) as fecha ${Prisma.raw(camposGestionados)}
      FROM swcc_bancoleads_postventa p
      INNER JOIN swcc_leads l ON l.idlead = p.idlead
      INNER JOIN swcc_agencias_bancoleads a ON a.id = p.idagencia
      ${Prisma.raw(innerGestionados)}
      ${Prisma.raw(where)} ${entreFechas}
    `);
  }

  async getLeadsAgente(userId: number): Promise<Record<string, unknown>[]> {
    return this.prisma.$queryRaw<Record<string, unknown>[]>(Prisma.sql`
      SELECT p.*, convert(varchar, p.fechahora_ing, 23) as fecha
      FROM swcc_bancoleads_postventa p
      LEFT JOIN swcc_postventa_citas c ON c.idcontactlead = p.idcontactlead
      WHERE p.idagente = ${userId} AND c.idcontactlead IS NULL
    `);
  }

  async getAllLeadsExport(): Promise<Record<string, unknown>[]> {
    return this.prisma.$queryRaw<Record<string, unknown>[]>(Prisma.sql`
      SELECT p.*, l.nombre as lead, a.agencia, t.nombres as agente,
        CASE WHEN c.interesado = 0 then 'No' else 'Sí' end as interesado,
        m.motivo, convert(varchar, c.fecha_reg, 23) as fecha_gestionado
      FROM swcc_bancoleads_postventa p
      INNER JOIN swcc_leads l ON l.idlead = p.idlead
      INNER JOIN swcc_agencias_bancoleads a ON a.id = p.idagencia
      INNER JOIN swcc_postventa_citas c ON c.idcontactlead = p.idcontactlead
      INNER JOIN swcc_postventa_motivos m ON m.id = c.motivo
      INNER JOIN w_sist_usuarios u ON u.id_usuario = p.idagente
      INNER JOIN terceros t ON t.nit = u.nit_usuario
    `);
  }

  async getMotivos(): Promise<Record<string, unknown>[]> {
    return this.prisma.$queryRaw<Record<string, unknown>[]>(Prisma.sql`
      SELECT * FROM swcc_postventa_motivos
    `);
  }

  async getAgentesAsignacion(ids: number[]): Promise<Record<string, unknown>[]> {
    if (ids.length === 0) return [];
    const idList = Prisma.join(ids.map((id) => Prisma.sql`${id}`));
    return this.prisma.$queryRaw<Record<string, unknown>[]>(Prisma.sql`
      SELECT u.id_usuario, t.nombres
      FROM w_sist_usuarios u
      INNER JOIN terceros t ON t.nit = u.nit_usuario
      WHERE u.id_usuario IN (${idList})
    `);
  }

  async asignarAgente(idleads: string, agente: number): Promise<boolean> {
    const ids = idleads.split('_').map((id) => Number(id)).filter((id) => id > 0);
    if (ids.length === 0) return false;

    const idList = Prisma.join(ids.map((id) => Prisma.sql`${id}`));
    const result = await this.prisma.$executeRaw(Prisma.sql`
      UPDATE swcc_bancoleads_postventa
      SET idagente = ${agente}
      WHERE idcontactlead IN (${idList})
    `);
    return result > 0;
  }

  async saveGestion(data: Record<string, unknown>): Promise<boolean> {
    const keys = Object.keys(data);
    if (keys.length === 0) return false;

    const columns = keys.map((k) => Prisma.raw(`[${k}]`));
    const values = keys.map((k) => data[k]);

    const result = await this.prisma.$executeRaw(
      Prisma.sql`INSERT INTO swcc_postventa_citas (${Prisma.join(columns)}) VALUES (${Prisma.join(values.map((v) => Prisma.sql`${v}`))})`,
    );
    return result > 0;
  }
}
