import { BadRequestException, Injectable } from '@nestjs/common';
import { IRelacionMargenMaterialesColoristaRepository } from '../../domain/relacion-margen-materiales-colorista.repository';
import {
  RelacionMargenMaterialesColoristaResponseEntity,
  ResumenRelacionMargenMaterialColoristaEntity,
} from '../../domain/relacion-margen-materiales-colorista.entity';
import {
  bodegasPorSede,
  esSedeCucuta,
} from '../../domain/relacion-margen-materiales-colorista.constants';

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

  async execute(input: {
    ano: number;
    mes: number;
    sede: string;
  }): Promise<RelacionMargenMaterialesColoristaResponseEntity> {
    const bodegas = bodegasPorSede(input.sede);
    if (!bodegas) {
      throw new BadRequestException(
        'El parámetro sede es obligatorio (giron o cucuta).',
      );
    }
    const rows = await this.repository.listar({
      ano: input.ano,
      mes: input.mes,
      bodegas,
    });

    const rowsConMes = rows.map((row) => ({
      ...row,
      nombreMes: this.meses[row.mes] ?? String(row.mes),
    }));

    const totalValor = rowsConMes.reduce((acc, row) => acc + row.valor, 0);
    const totalCosto = rowsConMes.reduce((acc, row) => acc + row.costo, 0);
    const margenTotal =
      totalValor > 0 ? ((totalValor - totalCosto) / totalValor) * 100 : 0;

    const esCucuta = esSedeCucuta(bodegas);
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
