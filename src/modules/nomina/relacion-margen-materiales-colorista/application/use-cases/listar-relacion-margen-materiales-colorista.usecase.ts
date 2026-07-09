import { Injectable } from '@nestjs/common';
import {
  FiltrosRelacionMargenMaterialesColorista,
  IRelacionMargenMaterialesColoristaRepository,
} from '../../domain/relacion-margen-materiales-colorista.repository';
import {
  RelacionMargenMaterialesColoristaResponseEntity,
  ResumenRelacionMargenMaterialColoristaEntity,
} from '../../domain/relacion-margen-materiales-colorista.entity';

@Injectable()
export class ListarRelacionMargenMaterialesColoristaUseCase {
  private readonly meses: Record<number, string> = {
    1: 'Enero',
    2: 'Febrero',
    3: 'Marzo',
    4: 'Abril',
    5: 'Mayo',
    6: 'Junio',
    7: 'Julio',
    8: 'Agosto',
    9: 'Septiembre',
    10: 'Octubre',
    11: 'Noviembre',
    12: 'Diciembre',
  };

  constructor(
    private readonly repository: IRelacionMargenMaterialesColoristaRepository,
  ) {}

  async execute(
    filtros: FiltrosRelacionMargenMaterialesColorista,
  ): Promise<RelacionMargenMaterialesColoristaResponseEntity> {
    const rows = await this.repository.listar(filtros);

    const rowsConMes = rows.map((row) => ({
      ...row,
      nombreMes: this.meses[row.mes] ?? String(row.mes),
    }));

    const totalValor = rowsConMes.reduce((acc, row) => acc + row.valor, 0);
    const totalCosto = rowsConMes.reduce((acc, row) => acc + row.costo, 0);
    const margenTotal =
      totalValor > 0 ? ((totalValor - totalCosto) / totalValor) * 100 : 0;

    const esCucuta =
      filtros.bodegas.includes(14) && filtros.bodegas.includes(22);
    const bono = this.calcularBono(margenTotal, esCucuta);

    return new RelacionMargenMaterialesColoristaResponseEntity({
      rows: rowsConMes,
      resumen: new ResumenRelacionMargenMaterialColoristaEntity({
        totalValor,
        totalCosto,
        margenTotal,
        bono,
      }),
    });
  }

  private calcularBono(margenTotal: number, esCucuta: boolean): number {
    if (margenTotal < 20) return 0;
    if (margenTotal < 25) return 200000;
    if (margenTotal < 30) return esCucuta ? 250000 : 300000;
    return esCucuta ? 300000 : 500000;
  }
}
