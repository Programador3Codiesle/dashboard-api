import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import {
  AdicionalManoObraPesado,
  AdicionalNombrePesado,
  AdicionalRepuestoPesado,
  BulkManoObraAdicionalPesadoInput,
  BulkRepuestoAdicionalPesadoInput,
  BulkResultAdicionalPesado,
  ClaseAdicionalPesado,
  FiltrosListaAdicionalesPesados,
  ICotizadorAdicionalesPesadosRepository,
} from '../../domain/cotizador-adicionales-pesados.repository';

@Injectable()
export class CotizadorAdicionalesPesadosPrismaRepository implements ICotizadorAdicionalesPesadosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getClasesPesados(): Promise<ClaseAdicionalPesado[]> {
    const rows = await this.prisma.$queryRaw<ClaseAdicionalPesado[]>`
      SELECT DISTINCT v.clase, cl.descripcion
      FROM v_vh_vehiculos v
      INNER JOIN referencias_cla cl ON v.clase = cl.clase
      INNER JOIN documentos_lin dl ON dl.codigo = v.codigo
      INNER JOIN vh_modelo m ON v.modelo = m.modelo
      INNER JOIN vh_familias f ON m.familia = f.familia
      WHERE sw = 1
        AND cantidad_devuelta IS NULL
        AND (f.descripcion LIKE 'F%' OR f.descripcion LIKE 'N%')
        AND f.id NOT IN (51,84)
        AND v.marca = '010'
        AND v.clase NOT IN ('*', 'GENERICO')
      ORDER BY v.clase
    `;
    return rows ?? [];
  }

  async getAdicionales(): Promise<AdicionalNombrePesado[]> {
    const rows = await this.prisma.$queryRaw<AdicionalNombrePesado[]>`
      SELECT id, adicional, estado
      FROM postv_adicionales_name_p
      ORDER BY adicional ASC
    `;
    return rows ?? [];
  }

  async existsAdicionalNombre(nombre: string): Promise<boolean> {
    const rows = await this.prisma.$queryRaw<{ cantidad: number }[]>`
      SELECT COUNT(*) AS cantidad
      FROM postv_adicionales_name_p
      WHERE adicional = ${nombre}
    `;
    const count = rows?.[0]?.cantidad ?? 0;
    return count > 0;
  }

  async createAdicionalNombre(nombre: string): Promise<void> {
    await this.prisma.$executeRaw`
      INSERT INTO postv_adicionales_name_p (adicional, estado)
      VALUES (${nombre}, 0)
    `;
  }

  async listarRepuestos(
    filtros: FiltrosListaAdicionalesPesados,
  ): Promise<AdicionalRepuestoPesado[]> {
    const whereParts: Prisma.Sql[] = [];

    if (typeof filtros.adicionalId === 'number') {
      whereParts.push(Prisma.sql`r.adicional = ${filtros.adicionalId}`);
    }
    if (filtros.clases && filtros.clases.length > 0) {
      whereParts.push(Prisma.sql`r.clase IN (${Prisma.join(filtros.clases)})`);
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
      FROM dbo.postv_reptos_adicionales_pesados r
      INNER JOIN dbo.postv_adicionales_name_p n ON r.adicional = n.id
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
    filtros: FiltrosListaAdicionalesPesados,
  ): Promise<AdicionalManoObraPesado[]> {
    const whereParts: Prisma.Sql[] = [];

    if (typeof filtros.adicionalId === 'number') {
      whereParts.push(Prisma.sql`r.adicional = ${filtros.adicionalId}`);
    }
    if (filtros.clases && filtros.clases.length > 0) {
      whereParts.push(Prisma.sql`r.clase IN (${Prisma.join(filtros.clases)})`);
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
      FROM dbo.postv_mo_adicionales_pesados r
      INNER JOIN dbo.postv_adicionales_name_p n ON r.adicional = n.id
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
    repuestos: BulkRepuestoAdicionalPesadoInput[],
    manoObra: BulkManoObraAdicionalPesadoInput[],
  ): Promise<BulkResultAdicionalPesado> {
    let repuestos_add = 0;
    let repuestos_fail = 0;
    let mano_add = 0;
    let mano_fail = 0;

    for (const clase of clases) {
      for (const r of repuestos) {
        const existsRows = await this.prisma.$queryRaw<{ cantidad: number }[]>`
          SELECT COUNT(*) AS cantidad
          FROM dbo.postv_reptos_adicionales_pesados
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
          INSERT INTO dbo.postv_reptos_adicionales_pesados
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
          FROM dbo.postv_mo_adicionales_pesados
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
          INSERT INTO dbo.postv_mo_adicionales_pesados
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
