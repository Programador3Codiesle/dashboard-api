import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { InformePosiblesRetornosFacade } from '../application/informe-posibles-retornos.facade';
import { GetGraficoDto } from '../application/dto/get-grafico.dto';

const CODIESEL_EMPRESA_ID = 1;

function assertCodieselEmpresa(req: {
  cookies?: Record<string, string>;
}): void {
  let empresa: number | null = null;

  if (req.cookies?.['user']) {
    try {
      const userCookie = JSON.parse(req.cookies['user']) as {
        empresa?: number | string;
      };
      if (userCookie?.empresa != null) {
        empresa = Number(userCookie.empresa);
      }
    } catch {
      /* ignore parse errors */
    }
  }

  if (empresa !== CODIESEL_EMPRESA_ID) {
    throw new ForbiddenException(
      'Este informe solo está disponible para Codiesel',
    );
  }
}

@UseGuards(JwtAuthGuard)
@Controller('taller/informe-posibles-retornos')
export class InformePosiblesRetornosController {
  constructor(private readonly facade: InformePosiblesRetornosFacade) {}

  @Get('catalogos')
  obtenerCatalogos(@Req() req: { cookies?: Record<string, string> }) {
    assertCodieselEmpresa(req);
    return this.facade.obtenerCatalogos();
  }

  @Post('grafico')
  obtenerGrafico(
    @Req() req: { cookies?: Record<string, string> },
    @Body() dto: GetGraficoDto,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.obtenerGrafico(dto);
  }
}
