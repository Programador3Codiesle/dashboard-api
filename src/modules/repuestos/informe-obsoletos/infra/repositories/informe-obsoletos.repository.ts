import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { ConsultarObsoletosDto } from '../../application/dto/informe-obsoletos.dto';

export type ObsoletoFiltroRow = {
  codigo: string;
  descripcion: string;
  bodega: number;
  stock: number;
  costo_unitario: number;
  cos_promedio: number;
  meses: number;
  pvp: number;
};

@Injectable()
export class InformeObsoletosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async consultar(dto: ConsultarObsoletosDto): Promise<ObsoletoFiltroRow[]> {
    const operador = dto.categoria === 1 ? '>=' : '<=';
    const rangoMeses = this.rangoMeses(dto.opcion);

    return this.prisma.$queryRaw<ObsoletoFiltroRow[]>(Prisma.sql`
      SELECT * FROM (
        SELECT v.codigo, v.descripcion, v.bodega, v.stock, v.costo_unitario,
          v.cos_promedio,
          meses = CASE
            WHEN ISNULL(v.ultima_venta, '2000-01-02') >= ISNULL(v.ultima_compra, '2000-01-01')
            THEN DATEDIFF(MONTH, v.ultima_venta, CONVERT(date, GETDATE()))
            ELSE DATEDIFF(MONTH, v.ultima_compra, CONVERT(date, GETDATE()))
          END,
          pvp = ISNULL(pr.precio_1, 0)
        FROM v_inventario_rptos_hoy_bodegas v
        LEFT JOIN referencias_pre pr ON v.codigo = pr.codigo
      ) a
      WHERE meses BETWEEN ${rangoMeses.min} AND ${rangoMeses.max}
        AND cos_promedio ${Prisma.raw(operador)} ${dto.rango}
        AND bodega NOT IN (99)
      ORDER BY cos_promedio DESC
    `);
  }

  private rangoMeses(opcion: 1 | 2 | 3 | 4): { min: number; max: number } {
    switch (opcion) {
      case 1:
        return { min: 0, max: 12 };
      case 2:
        return { min: 9, max: 12 };
      case 3:
        return { min: 12, max: 24 };
      case 4:
        return { min: 25, max: 9999 };
      default:
        return { min: 0, max: 12 };
    }
  }
}
