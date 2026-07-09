import { Injectable } from '@nestjs/common';
import { ConsultarObsoletosDto } from './dto/informe-obsoletos.dto';
import { InformeObsoletosRepository } from '../infra/repositories/informe-obsoletos.repository';

@Injectable()
export class InformeObsoletosFacade {
  constructor(private readonly repo: InformeObsoletosRepository) {}

  async consultar(dto: ConsultarObsoletosDto) {
    const rows = await this.repo.consultar(dto);
    return rows.map((row) => {
      const pvp = Number(row.pvp ?? 0);
      const costo = Number(row.costo_unitario ?? 0);
      const margen = pvp > 0 ? ((pvp - costo) / pvp) * 100 : 0;
      return {
        codigo: row.codigo,
        descripcion: row.descripcion,
        bodega: row.bodega,
        stock: Number(row.stock),
        costoUnitario: costo,
        costoPromedio: Number(row.cos_promedio),
        meses: Number(row.meses),
        pvp,
        margen,
      };
    });
  }
}
