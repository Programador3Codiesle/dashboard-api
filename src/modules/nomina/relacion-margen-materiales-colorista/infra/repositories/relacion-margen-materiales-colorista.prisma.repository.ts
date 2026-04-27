import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosRelacionMargenMaterialesColorista,
  IRelacionMargenMaterialesColoristaRepository,
} from '../../domain/relacion-margen-materiales-colorista.repository';
import { RelacionMargenMaterialColoristaEntity } from '../../domain/relacion-margen-materiales-colorista.entity';

type RawRelacionRow = {
  ano: number;
  mes: number;
  bodega: number;
  numero_orden: number;
  valor: number;
  costo: number;
};

@Injectable()
export class RelacionMargenMaterialesColoristaPrismaRepository
  implements IRelacionMargenMaterialesColoristaRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async listar(
    filtros: FiltrosRelacionMargenMaterialesColorista,
  ): Promise<RelacionMargenMaterialColoristaEntity[]> {
    const rows = await this.prisma.$queryRaw<RawRelacionRow[]>(Prisma.sql`
      SELECT ano, mes, bodega, numero_orden, valor, costo
      FROM v_relacion_materiales
      WHERE ano = ${filtros.ano}
        AND mes = ${filtros.mes}
        AND bodega IN (${Prisma.join(filtros.bodegas)})
      ORDER BY numero_orden ASC
    `);

    return rows.map((row) => {
      const valor = Number(row.valor ?? 0);
      const costo = Number(row.costo ?? 0);
      const margen = valor !== 0 ? ((valor - costo) / valor) * 100 : 0;

      return new RelacionMargenMaterialColoristaEntity({
        ano: Number(row.ano),
        mes: Number(row.mes),
        nombreMes: '',
        bodega: Number(row.bodega),
        numeroOrden: Number(row.numero_orden),
        valor,
        costo,
        margen,
      });
    });
  }
}

