import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import {
  CHECKLIST_BOOLEAN_COLUMNS,
  CHECKLIST_COLUMNAS,
  CHECKLIST_TABLAS,
  ChecklistTipo,
} from '../../domain/checklist-definitions';
import { IChecklistGuardarRepository } from '../../domain/checklist-guardar.repository';

const CORREOS_FIJOS = [
  'personal@codiesel.co',
  'salud.ocupacional@codiesel.co',
  'mantenimiento@codiesel.co',
  'mantenimiento.c@codiesel.co',
];

@Injectable()
export class ChecklistGuardarPrismaRepository implements IChecklistGuardarRepository {
  constructor(private readonly prisma: PrismaService) {}

  async insertar(
    tipo: ChecklistTipo,
    data: Record<string, unknown>,
  ): Promise<number | null> {
    const allowed = new Set(CHECKLIST_COLUMNAS[tipo]);
    const booleanCols = new Set(CHECKLIST_BOOLEAN_COLUMNS[tipo] ?? []);

    const entries = Object.entries(data).filter(([key, value]) => {
      if (!allowed.has(key)) return false;
      if (value === '' || value === null || value === undefined) return false;
      return true;
    });

    if (entries.length === 0) return null;

    const columns = entries.map(([key]) => Prisma.raw(`[${key}]`));
    const values = entries.map(([key, value]) => {
      if (booleanCols.has(key)) {
        const n = Number(value);
        return Prisma.sql`${n === 1 ? 1 : 0}`;
      }
      if (key === 'fecha' && typeof value === 'string') {
        return Prisma.sql`CAST(${value} AS DATE)`;
      }
      return Prisma.sql`${value}`;
    });

    const tableName = this.tablaSql(tipo);
    const rows = await this.prisma.$queryRaw<Array<{ id: bigint | number }>>(
      Prisma.sql`
        INSERT INTO ${tableName} (${Prisma.join(columns)})
        OUTPUT INSERTED.id
        VALUES (${Prisma.join(values)})
      `,
    );

    const id = rows[0]?.id;
    return id != null ? Number(id) : null;
  }

  async obtenerCorreosJefes(nitEmpleado: number): Promise<string[]> {
    const rows = await this.prisma.$queryRaw<Array<{ correo: string }>>(
      Prisma.sql`
        SELECT j.correo
        FROM terceros t
        INNER JOIN postv_jefes j ON j.nit_jefe = t.nit
        INNER JOIN postv_empleado_jefe je ON je.jefe = j.id_jefe
        INNER JOIN postv_empleados e ON e.id_empleado = je.empleado
        WHERE e.nit_empleado = ${nitEmpleado}
          AND je.jefe NOT IN (24, 5)
          AND j.correo IS NOT NULL
          AND LTRIM(RTRIM(j.correo)) <> ''
      `,
    );

    const correos = [...CORREOS_FIJOS];
    for (const row of rows) {
      const c = row.correo?.trim();
      if (c && !correos.includes(c)) correos.push(c);
    }
    return correos;
  }

  private tablaSql(tipo: ChecklistTipo): Prisma.Sql {
    return Prisma.raw(CHECKLIST_TABLAS[tipo]);
  }
}
