import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import type {
  MiPerfilHorario,
  MiPerfilJefe,
  MiPerfilTallas,
} from '../../domain/mi-perfil';
import {
  IMiPerfilRepository,
  type MiPerfilUsuarioRow,
} from '../../domain/repositories/mi-perfil.repository';

function asText(value: unknown): string | null {
  if (value == null) return null;
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'bigint'
  ) {
    const text = String(value).trim();
    return text.length > 0 ? text : null;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const hh = String(value.getUTCHours()).padStart(2, '0');
    const mm = String(value.getUTCMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  return null;
}

function asHora(value: unknown): string | null {
  const text = asText(value);
  if (!text) return null;
  const match = text.match(/(\d{1,2}):(\d{2})/);
  if (!match) return text;
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

@Injectable()
export class MiPerfilPrismaRepository implements IMiPerfilRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUsuarioByNit(nit: number): Promise<MiPerfilUsuarioRow | null> {
    const rows = await this.prisma.$queryRaw<
      Array<{
        nombres: unknown;
        nom_perfil: unknown;
        nit: unknown;
        mail: unknown;
        telefono_1: unknown;
        telefono_2: unknown;
      }>
    >`
      SELECT TOP 1
        t.nombres,
        p.nom_perfil,
        t.nit,
        t.mail,
        t.telefono_1,
        t.telefono_2
      FROM w_sist_usuarios u
      INNER JOIN terceros t ON t.nit = u.nit_usuario
      INNER JOIN postv_perfiles p ON p.id_perfil = u.perfil_postventa
      WHERE t.nit = ${nit}
    `;

    const row = rows[0];
    if (!row) return null;

    return {
      nombres: asText(row.nombres),
      nom_perfil: asText(row.nom_perfil),
      nit: asText(row.nit),
      mail: asText(row.mail),
      telefono_1: asText(row.telefono_1),
      telefono_2: asText(row.telefono_2),
    };
  }

  async findHorarioByNit(nit: number): Promise<MiPerfilHorario | null> {
    const rows = await this.prisma.$queryRaw<
      Array<{
        sede: unknown;
        hora_ent_sem_am: unknown;
        hora_sal_sem_am: unknown;
        hora_ent_sem_pm: unknown;
        hora_sal_sem_pm: unknown;
        hora_ent_am_viernes: unknown;
        hora_sal_am_viernes: unknown;
        hora_ent_viernes_pm: unknown;
        hora_sal_viernes: unknown;
        hora_ent_fds: unknown;
        hora_sal_fds: unknown;
      }>
    >`
      SELECT TOP 1
        sede,
        hora_ent_sem_am,
        hora_sal_sem_am,
        hora_ent_sem_pm,
        hora_sal_sem_pm,
        hora_ent_am_viernes,
        hora_sal_am_viernes,
        hora_ent_viernes_pm,
        hora_sal_viernes,
        hora_ent_fds,
        hora_sal_fds
      FROM postv_horarios_empleados
      WHERE nit_empleado = ${nit}
    `;

    const row = rows[0];
    if (!row) return null;

    return {
      sede: asText(row.sede),
      hora_ent_sem_am: asHora(row.hora_ent_sem_am),
      hora_sal_sem_am: asHora(row.hora_sal_sem_am),
      hora_ent_sem_pm: asHora(row.hora_ent_sem_pm),
      hora_sal_sem_pm: asHora(row.hora_sal_sem_pm),
      hora_ent_am_viernes: asHora(row.hora_ent_am_viernes),
      hora_sal_am_viernes: asHora(row.hora_sal_am_viernes),
      hora_ent_viernes_pm: asHora(row.hora_ent_viernes_pm),
      hora_sal_viernes: asHora(row.hora_sal_viernes),
      hora_ent_fds: asHora(row.hora_ent_fds),
      hora_sal_fds: asHora(row.hora_sal_fds),
    };
  }

  async findTallasByNit(nit: number): Promise<MiPerfilTallas | null> {
    const rows = await this.prisma.$queryRaw<
      Array<{
        talla_camisa: unknown;
        talla_pantalon: unknown;
        talla_botas: unknown;
      }>
    >`
      SELECT TOP 1 talla_camisa, talla_pantalon, talla_botas
      FROM swcrm_tallas_personal
      WHERE nit = ${nit}
      ORDER BY id DESC
    `;

    const row = rows[0];
    if (!row) return null;

    return {
      talla_camisa: asText(row.talla_camisa),
      talla_pantalon: asText(row.talla_pantalon),
      talla_botas: asText(row.talla_botas),
    };
  }

  async findJefesByNit(nit: number): Promise<MiPerfilJefe[]> {
    const rows = await this.prisma.$queryRaw<
      Array<{ nombres: unknown; nom_perfil: unknown }>
    >`
      SELECT t.nombres, pp.nom_perfil
      FROM postv_empleados emp
      INNER JOIN postv_empleado_jefe ej ON ej.empleado = emp.id_empleado
      INNER JOIN postv_jefes jf ON jf.id_jefe = ej.jefe
      INNER JOIN w_sist_usuarios ws ON ws.nit_usuario = jf.nit_jefe
      INNER JOIN terceros t ON t.nit = ws.nit_usuario
      INNER JOIN postv_perfiles pp ON pp.id_perfil = ws.perfil_postventa
      WHERE emp.nit_empleado = ${nit}
    `;

    return rows
      .map((row) => ({
        nombres: asText(row.nombres) ?? '',
        nom_perfil: asText(row.nom_perfil),
      }))
      .filter((jefe) => jefe.nombres.length > 0);
  }
}
