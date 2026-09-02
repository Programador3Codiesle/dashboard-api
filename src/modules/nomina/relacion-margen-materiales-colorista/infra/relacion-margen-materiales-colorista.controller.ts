import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { RelacionMargenMaterialesColoristaFacade } from '../application/relacion-margen-materiales-colorista.facade';
import { parseYearMonthParam } from '../../shared/parse-year-month';

@Controller('nomina/relacion-margen-materiales-colorista')
@UseGuards(JwtAuthGuard)
export class RelacionMargenMaterialesColoristaController {
  constructor(
    private readonly facade: RelacionMargenMaterialesColoristaFacade,
  ) {}

  @Get()
  async listar(@Query('mes') mes: string, @Query('sede') sede: string) {
    const { ano, mes: mesNum } = parseYearMonthParam(
      mes,
      'El parámetro mes es obligatorio y debe tener formato YYYY-MM.',
    );
    return this.facade.listar({
      ano,
      mes: mesNum,
      sede,
    });
  }
}
