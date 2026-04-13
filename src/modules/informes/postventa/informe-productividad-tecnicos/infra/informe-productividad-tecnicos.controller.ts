import { Controller, Get, Query } from '@nestjs/common';
import { ProductividadTecnicosFacade } from '../application/productividad-tecnicos.facade';
import { ProductividadTecnicosResponseEntity } from '../domain/productividad-tecnicos.entity';

@Controller('informes/postventa/productividad-tecnicos')
export class InformeProductividadTecnicosController {
  constructor(private readonly facade: ProductividadTecnicosFacade) {}

  @Get()
  obtener(
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('patios') patios: string | undefined,
  ): Promise<ProductividadTecnicosResponseEntity> {
    const yearNum = Number(year);
    const monthNum = Number(month);

    const patiosArray =
      patios && patios.trim().length > 0
        ? patios
            .split(',')
            .map((p) => Number(p.trim()))
            .filter((p) => !Number.isNaN(p))
        : [];

    return this.facade.obtenerProductividad({
      year: Number.isNaN(yearNum) ? new Date().getFullYear() : yearNum,
      month: Number.isNaN(monthNum) ? new Date().getMonth() + 1 : monthNum,
      patios: patiosArray,
    });
  }
}
