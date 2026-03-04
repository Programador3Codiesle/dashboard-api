import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import {
  AdicionalManoObraLiviano,
  AdicionalNombreLiviano,
  AdicionalRepuestoLiviano,
  BulkManoObraAdicionalLivianoInput,
  BulkRepuestoAdicionalLivianoInput,
  BulkResultAdicionalLiviano,
  ClaseAdicionalLiviano,
  FiltrosListaAdicionalesLivianos,
  ICotizadorAdicionalesLivianosRepository,
} from '../../domain/cotizador-adicionales-livianos.repository';

@Injectable()
export class CotizadorAdicionalesLivianosPrismaRepository
  implements ICotizadorAdicionalesLivianosRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async getClasesAdicionales(): Promise<ClaseAdicionalLiviano[]> {
    const rows = await this.prisma.$queryRaw<ClaseAdicionalLiviano[]>`
      SELECT DISTINCT v.clase, cl.descripcion
      FROM v_vh_vehiculos v
      INNER JOIN referencias_cla cl ON v.clase = cl.clase
      INNER JOIN documentos_lin dl ON dl.codigo = v.codigo
      INNER JOIN vh_modelo m ON v.modelo = m.modelo
      INNER JOIN vh_familias f ON m.familia = f.familia
      WHERE sw = 1
        AND cantidad_devuelta IS NULL
        AND v.marca = '010'
        AND v.clase NOT IN ('*', 'GENERICO')
        AND ((f.descripcion NOT LIKE 'F%' AND f.descripcion NOT LIKE 'N%')
          OR f.id IN (51, 84))
      ORDER BY v.clase
    `;
    return rows ?? [];
  }

  async getAdicionales(): Promise<AdicionalNombreLiviano[]> {
    const rows = await this.prisma.$queryRaw<AdicionalNombreLiviano[]>`
      SELECT id, adicional, estado
      FROM dbo.postv_adicionales_name
      ORDER BY adicional ASC
    `;
    return rows ?? [];
  }

  async existsAdicionalNombre(nombre: string): Promise<boolean> {
    const rows = await this.prisma.$queryRaw<{ cantidad: number }[]>`
      SELECT COUNT(*) AS cantidad
      FROM dbo.postv_adicionales_name
      WHERE adicional = ${nombre}
    `;
    const count = rows?.[0]?.cantidad ?? 0;
    return count > 0;
  }

  async createAdicionalNombre(nombre: string): Promise<void> {
    await this.prisma.$executeRaw`
      INSERT INTO dbo.postv_adicionales_name (adicional, estado)
      VALUES (${nombre}, 0)
    `;
  }

  async listarRepuestos(
    filtros: FiltrosListaAdicionalesLivianos,
  ): Promise<AdicionalRepuestoLiviano[]> {
    const whereParts: Prisma.Sql[] = [];

    if (typeof filtros.adicionalId === 'number') {
      whereParts.push(Prisma.sql`r.adicional = ${filtros.adicionalId}`);
    }
    if (filtros.clases && filtros.clases.length > 0) {
      whereParts.push(
        Prisma.sql`r.clase IN (${Prisma.join(filtros.clases)})`,
      );
    }

    const whereSql =
      whereParts.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(whereParts, ' AND ')}`
        : Prisma.empty;

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        r.seq,
        r.clase,
        r.codigo,
        r.descripcion,
        r.cantidad,
        r.year_start,
        r.year_end,
        r.descuento,
        n.id        AS adicionalId,
        n.adicional AS adicionalNombre,
        n.estado
      FROM dbo.postv_reptos_adicionales r
      INNER JOIN dbo.postv_adicionales_name n ON r.adicional = n.id
      ${whereSql}
      ORDER BY r.adicional ASC, r.clase ASC
    `;

    return (rows ?? []).map((r) => ({
      seq: r.seq,
      clase: r.clase,
      codigo: r.codigo,
      descripcion: r.descripcion,
      cantidad: r.cantidad,
      year_start: r.year_start,
      year_end: r.year_end,
      descuento: r.descuento,
      adicionalId: r.adicionalId,
      adicionalNombre: r.adicionalNombre,
      estado: r.estado,
    }));
  }

  async listarManoObra(
    filtros: FiltrosListaAdicionalesLivianos,
  ): Promise<AdicionalManoObraLiviano[]> {
    const whereParts: Prisma.Sql[] = [];

    if (typeof filtros.adicionalId === 'number') {
      whereParts.push(Prisma.sql`r.adicional = ${filtros.adicionalId}`);
    }
    if (filtros.clases && filtros.clases.length > 0) {
      whereParts.push(
        Prisma.sql`r.clase IN (${Prisma.join(filtros.clases)})`,
      );
    }

    const whereSql =
      whereParts.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(whereParts, ' AND ')}`
        : Prisma.empty;

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        r.id,
        r.clase,
        r.operacion,
        r.tiempo,
        r.valor_menos_5anos,
        r.valor_mas_5anos,
        r.descuento,
        n.adicional AS adicionalNombre,
        n.id        AS adicionalId,
        n.estado
      FROM dbo.postv_mo_adicionales r
      INNER JOIN dbo.postv_adicionales_name n ON r.adicional = n.id
      ${whereSql}
      ORDER BY r.adicional ASC, r.clase ASC
    `;

    return (rows ?? []).map((r) => ({
      id: r.id,
      clase: r.clase,
      operacion: r.operacion,
      tiempo: r.tiempo,
      valor_menos_5anos: r.valor_menos_5anos,
      valor_mas_5anos: r.valor_mas_5anos,
      descuento: r.descuento,
      adicionalId: r.adicionalId,
      adicionalNombre: r.adicionalNombre,
      estado: r.estado,
    }));
  }

  async bulkInsert(
    adicionalId: number,
    clases: string[],
    repuestos: BulkRepuestoAdicionalLivianoInput[],
    manoObra: BulkManoObraAdicionalLivianoInput[],
  ): Promise<BulkResultAdicionalLiviano> {
    let repuestos_add = 0;
    let repuestos_fail = 0;
    let mano_add = 0;
    let mano_fail = 0;

    for (const clase of clases) {
      for (const r of repuestos) {
        const existsRows = await this.prisma.$queryRaw<{ cantidad: number }[]>`
          SELECT COUNT(*) AS cantidad
          FROM dbo.postv_reptos_adicionales
          WHERE codigo = ${r.codigo}
            AND adicional = ${adicionalId}
            AND clase = ${clase}
        `;
        const exists = (existsRows?.[0]?.cantidad ?? 0) > 0;

        if (exists) {
          repuestos_fail++;
          continue;
        }

        const inserted = await this.prisma.$executeRaw`
          INSERT INTO dbo.postv_reptos_adicionales
            (clase, codigo, descripcion, cantidad, clase_operacion, adicional, year_start, year_end, descuento)
          VALUES
            (${clase}, ${r.codigo}, ${r.descripcion}, ${r.cantidad}, 'R', ${adicionalId},
             ${r.yearStart}, ${r.yearEnd}, ${r.descuento ?? null})
        `;

        if (inserted > 0) repuestos_add++;
        else repuestos_fail++;
      }

      for (const m of manoObra) {
        const existsRows = await this.prisma.$queryRaw<{ cantidad: number }[]>`
          SELECT COUNT(*) AS cantidad
          FROM dbo.postv_mo_adicionales
          WHERE operacion = ${m.operacion}
            AND adicional = ${adicionalId}
            AND clase = ${clase}
        `;
        const exists = (existsRows?.[0]?.cantidad ?? 0) > 0;

        if (exists) {
          mano_fail++;
          continue;
        }

        const inserted = await this.prisma.$executeRaw`
          INSERT INTO dbo.postv_mo_adicionales
            (clase, operacion, tiempo, valor_menos_5anos, valor_mas_5anos, adicional, descuento)
          VALUES
            (${clase}, ${m.operacion}, ${m.tiempo},
             ${m.valorMenos5}, ${m.valorMas5}, ${adicionalId}, ${m.descuento ?? null})
        `;

        if (inserted > 0) mano_add++;
        else mano_fail++;
      }
    }

    return { repuestos_add, repuestos_fail, mano_add, mano_fail };
  }
}

