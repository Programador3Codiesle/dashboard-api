import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import {
  AplicarEdicionRequest,
  AplicarEdicionResult,
  FiltroOpcionRequest,
  ICotizadorEdicionConfigRepository,
  TablaConfigEntry,
  TablaKeyEdicion,
} from '../../domain/cotizador-edicion-config.repository';

const TABLA_CONFIG: TablaConfigEntry[] = [
  {
    key: 'livianos_repuesto',
    tabla: 'Postv_repuestos_mto',
    columna_clase: 'Clase',
    filtros: ['Clase', 'Revision', 'Codigo'],
    excluir: ['Seq'],
    columnas_editables: ['Codigo', 'cantidad', 'descripcion'],
  },
  {
    key: 'livianos_mano_adicional',
    tabla: 'postv_adicionales_mto',
    columna_clase: 'clase',
    filtros: ['clase', 'codigo', 'revision'],
    excluir: ['seq_rpto'],
    columnas_editables: [
      'codigo',
      'descripcion',
      'cantidad',
      'tiempo_adicional',
      'valor_mas_5anos',
      'valor_menos_5anos',
    ],
  },
  {
    key: 'livianos_mano_trabajos',
    tabla: 'postv_trabajos_mto_livianos',
    columna_clase: 'clase',
    filtros: ['clase', 'operacion', 'revision'],
    excluir: ['seq'],
    columnas_editables: [
      'valor_unitario',
      'valor_mas_5anos',
      'cant_horas',
      'descripcion_operacion',
    ],
  },
  {
    key: 'pesados_repuesto',
    tabla: 'postv_reptos_mto_pesados',
    columna_clase: 'clase',
    filtros: ['clase', 'codigo', 'revision'],
    excluir: ['seq'],
    columnas_editables: ['codigo', 'cantidad', 'descripcion'],
  },
  {
    key: 'pesados_mano_adicional',
    tabla: 'postv_adicionales_mto_pesados',
    columna_clase: 'clase',
    filtros: ['clase', 'codigo', 'revision'],
    excluir: ['seq_rpto'],
    columnas_editables: [
      'codigo',
      'nombre_operacion',
      'cantidad',
      'tiempo_adicional',
      'valor',
    ],
  },
  {
    key: 'pesados_mano_trabajos',
    tabla: 'postv_trabajo_mto_pesados',
    columna_clase: 'clase',
    filtros: ['clase', 'grupo'],
    excluir: ['seq'],
    columnas_editables: ['descrpcion', 'horas'],
  },
];

@Injectable()
export class CotizadorEdicionConfigPrismaRepository
  implements ICotizadorEdicionConfigRepository
{
  constructor(private readonly prisma: PrismaService) {}

  getTablaConfig(): TablaConfigEntry[] {
    return TABLA_CONFIG;
  }

  private getConfig(tablaKey: TablaKeyEdicion): TablaConfigEntry {
    const cfg = TABLA_CONFIG.find((c) => c.key === tablaKey);
    if (!cfg) {
      throw new Error(`TablaKey no válida: ${tablaKey}`);
    }
    return cfg;
  }

  async getClasesDistinct(
    tablaKey: TablaKeyEdicion,
  ): Promise<{ clase: string; descripcion: string | null }[]> {
    const cfg = this.getConfig(tablaKey);

    const rows = await this.prisma.$queryRaw<
      { clase: string; descripcion: string | null }[]
    >(Prisma.sql`
      SELECT DISTINCT t.${Prisma.raw(cfg.columna_clase)} AS clase,
             c.descripcion
      FROM ${Prisma.raw(cfg.tabla)} t
      LEFT JOIN referencias_cla c
        ON t.${Prisma.raw(cfg.columna_clase)} = c.clase
      ORDER BY c.descripcion ASC
    `);

    return rows ?? [];
  }

  async getOpcionesFiltro(req: FiltroOpcionRequest): Promise<string[]> {
    const cfg = this.getConfig(req.tablaKey);

    if (!cfg.filtros.includes(req.filtro)) {
      return [];
    }

    const whereParts: Prisma.Sql[] = [];
    const values: (string | number)[] = [];

    Object.entries(req.whereParcial || {}).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) {
        whereParts.push(Prisma.sql`${Prisma.raw(k)} = ${v}`);
        values.push(v as any);
      }
    });

    const whereSql =
      whereParts.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(whereParts, ' AND ')}`
        : Prisma.empty;

    const rows = await this.prisma.$queryRaw<{ value: string }[]>(Prisma.sql`
      SELECT DISTINCT ${Prisma.raw(req.filtro)} AS value
      FROM ${Prisma.raw(cfg.tabla)}
      ${whereSql}
      ORDER BY ${Prisma.raw(req.filtro)} ASC
    `);

    const data = (rows ?? [])
      .map((r) => r.value)
      .filter((v) => v !== null && v !== undefined && v !== '');

    return Array.from(new Set(data));
  }

  async aplicarEdicion(
    req: AplicarEdicionRequest,
  ): Promise<AplicarEdicionResult> {
    const cfg = this.getConfig(req.tablaKey);

    const whereKeys = Object.keys(req.filtros || {});
    const setKeys = Object.keys(req.campos || {});

    if (whereKeys.length === 0 || setKeys.length === 0) {
      return { affectedRows: 0 };
    }

    for (const k of whereKeys) {
      if (!cfg.filtros.includes(k)) {
        return { affectedRows: -1 };
      }
    }
    for (const k of setKeys) {
      if (!cfg.columnas_editables.includes(k)) {
        return { affectedRows: -1 };
      }
    }

    const whereParts: Prisma.Sql[] = [];
    const setParts: Prisma.Sql[] = [];

    Object.entries(req.filtros).forEach(([k, v]) => {
      whereParts.push(Prisma.sql`${Prisma.raw(k)} = ${v}`);
    });
    Object.entries(req.campos).forEach(([k, v]) => {
      setParts.push(Prisma.sql`${Prisma.raw(k)} = ${v}`);
    });

    const whereSql = Prisma.sql`${Prisma.join(whereParts, ' AND ')}`;
    const setSql = Prisma.sql`${Prisma.join(setParts, ', ')}`;

    const result = await this.prisma.$executeRaw(
      Prisma.sql`
        UPDATE ${Prisma.raw(cfg.tabla)}
        SET ${setSql}
        WHERE ${whereSql}
      `,
    );

    return { affectedRows: result ?? 0 };
  }
}

