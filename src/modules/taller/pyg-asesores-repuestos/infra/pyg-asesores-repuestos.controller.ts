import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { PygAsesoresRepuestosFacade } from '../application/pyg-asesores-repuestos.facade';
import { GenerarInformeDto } from '../application/dto/generar-informe.dto';

function getEmpresaFromRequest(req: {
  cookies?: Record<string, string>;
}): number | null {
  if (!req.cookies?.['user']) return null;
  try {
    const userCookie = JSON.parse(req.cookies['user']) as {
      empresa?: number | string;
    };
    if (userCookie?.empresa != null) {
      return Number(userCookie.empresa);
    }
  } catch {
    /* ignore */
  }
  return null;
}

@UseGuards(JwtAuthGuard)
@Controller('taller/pyg-asesores-repuestos')
export class PygAsesoresRepuestosController {
  constructor(private readonly facade: PygAsesoresRepuestosFacade) {}

  @Post('generar')
  generar(
    @Req() req: { cookies?: Record<string, string> },
    @Body() dto: GenerarInformeDto,
  ) {
    const idEmpresa = getEmpresaFromRequest(req);
    if (idEmpresa == null || !Number.isFinite(idEmpresa) || idEmpresa <= 0) {
      throw new BadRequestException(
        'No se pudo obtener la empresa del usuario',
      );
    }
    return this.facade.generarInforme(dto, idEmpresa);
  }
}
