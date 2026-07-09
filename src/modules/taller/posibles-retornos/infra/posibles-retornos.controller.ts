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
import { PosiblesRetornosFacade } from '../application/posibles-retornos.facade';
import { CerrarBdcDto } from '../application/dto/cerrar-bdc.dto';
import { DetallePlacaDto } from '../application/dto/detalle-placa.dto';
import { GuardarDefinicionDto } from '../application/dto/guardar-definicion.dto';
import { ListarPosiblesRetornosDto } from '../application/dto/listar-posibles-retornos.dto';
import { SolucionOrdenDto } from '../application/dto/solucion-orden.dto';

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
      /* ignore */
    }
  }

  if (empresa !== CODIESEL_EMPRESA_ID) {
    throw new ForbiddenException(
      'Este módulo solo está disponible para Codiesel',
    );
  }
}

function getUsuarioFromRequest(req: {
  user?: { nit?: string | number };
}): string {
  if (req.user?.nit != null) {
    return String(req.user.nit);
  }
  return '';
}

@UseGuards(JwtAuthGuard)
@Controller('taller/posibles-retornos')
export class PosiblesRetornosController {
  constructor(private readonly facade: PosiblesRetornosFacade) {}

  @Get('catalogos')
  obtenerCatalogos(@Req() req: { cookies?: Record<string, string> }) {
    assertCodieselEmpresa(req);
    return this.facade.obtenerCatalogos();
  }

  @Post('listar')
  listar(
    @Req() req: { cookies?: Record<string, string> },
    @Body() dto: ListarPosiblesRetornosDto,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.listar(dto);
  }

  @Post('detalle')
  obtenerDetalle(
    @Req() req: { cookies?: Record<string, string> },
    @Body() dto: DetallePlacaDto,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.obtenerDetalle(dto);
  }

  @Post('definicion')
  guardarDefinicion(
    @Req() req: { cookies?: Record<string, string>; user?: { nit?: string } },
    @Body() dto: GuardarDefinicionDto,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.guardarDefinicion(dto, getUsuarioFromRequest(req));
  }

  @Post('solucion')
  obtenerSolucion(
    @Req() req: { cookies?: Record<string, string> },
    @Body() dto: SolucionOrdenDto,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.obtenerSolucion(dto);
  }

  @Post('cerrar-bdc')
  cerrarBdc(
    @Req() req: { cookies?: Record<string, string>; user?: { nit?: string } },
    @Body() dto: CerrarBdcDto,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.cerrarBdc(dto, getUsuarioFromRequest(req));
  }
}
