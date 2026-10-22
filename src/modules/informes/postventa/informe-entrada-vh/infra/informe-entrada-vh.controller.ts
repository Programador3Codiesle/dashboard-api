import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../auth/infra/jwt-auth.guard';
import {
  CODIESEL_EMPRESA_ID,
  readEmpresaIdFromCookie,
} from '../../../../../core/config/empresa-sesion';
import { EntradaVhFacade } from '../application/entrada-vh.facade';
import { resolverBodegasEntradaVh } from '../domain/lugares-entrada-vh';

@UseGuards(JwtAuthGuard)
@Controller('informes/postventa/entrada-vh')
export class InformeEntradaVhController {
  constructor(private readonly entradaVhFacade: EntradaVhFacade) {}

  @Get()
  async obtener(
    @Req() req: { cookies?: Record<string, string> },
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('lugar') lugar?: string,
    @Query('bodega') bodega?: string,
  ) {
    const empresaId = readEmpresaIdFromCookie(req.cookies);
    if (empresaId != null && empresaId !== CODIESEL_EMPRESA_ID) {
      throw new ForbiddenException(
        'Este informe solo está disponible para Chevrolet.',
      );
    }
    const parsedYear = Number(year);
    const parsedMonth = Number(month);

    if (!parsedYear || !parsedMonth) {
      throw new BadRequestException(
        'Los parámetros year y month son obligatorios y deben ser numéricos.',
      );
    }

    const bodegaNum =
      bodega != null && bodega !== '' ? Number(bodega) : undefined;
    if (bodegaNum != null && (!Number.isInteger(bodegaNum) || bodegaNum <= 0)) {
      throw new BadRequestException('La bodega debe ser un número entero.');
    }

    const bodegaIds = resolverBodegasEntradaVh(lugar, bodegaNum);
    if (!bodegaIds) {
      throw new BadRequestException(
        'El lugar o la bodega no pertenecen a este informe.',
      );
    }

    return this.entradaVhFacade.obtenerResumen({
      year: parsedYear,
      month: parsedMonth,
      bodegaIds,
    });
  }
}
