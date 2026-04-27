import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { RelacionMargenMaterialesColoristaFacade } from '../application/relacion-margen-materiales-colorista.facade';

@Controller('nomina/relacion-margen-materiales-colorista')
@UseGuards(JwtAuthGuard)
export class RelacionMargenMaterialesColoristaController {
  constructor(private readonly facade: RelacionMargenMaterialesColoristaFacade) {}

  @Get()
  async listar(@Query('mes') mes: string, @Query('sede') sede: string) {
    if (!mes || !/^\d{4}-\d{2}$/.test(mes)) {
      throw new BadRequestException(
        'El parámetro mes es obligatorio y debe tener formato YYYY-MM.',
      );
    }
    const bodegas = this.resolveBodegas(sede);
    const [anoStr, mesStr] = mes.split('-');
    return this.facade.listar({
      ano: Number(anoStr),
      mes: Number(mesStr),
      bodegas,
    });
  }

  private resolveBodegas(sede: string): number[] {
    if (sede === 'giron') return [9, 21];
    if (sede === 'cucuta') return [14, 22];
    throw new BadRequestException(
      'El parámetro sede es obligatorio (giron o cucuta).',
    );
  }
}

