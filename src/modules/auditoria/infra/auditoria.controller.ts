import {
  Controller,
  ForbiddenException,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/infra/jwt-auth.guard';
import { AuditoriaFacade } from '../application/auditoria.facade';

const CODIESEL_EMPRESA_ID = 1;

type AuthRequest = {
  cookies?: Record<string, string>;
};

function assertCodieselEmpresa(req: AuthRequest): void {
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

@Controller('auditoria')
@UseGuards(JwtAuthGuard)
export class AuditoriaController {
  constructor(private readonly facade: AuditoriaFacade) {}

  @Get('ordenes-diarias')
  ordenesDiarias(
    @Req() req: AuthRequest,
    @Query('fecha') fecha: string,
    @Query('bodega') bodega: string,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.ordenesDiarias(fecha, bodega);
  }

  @Get('entregas')
  entregas(
    @Req() req: AuthRequest,
    @Query('ano') ano: string,
    @Query('tipo') tipo: string,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.entregas(Number(ano), Number(tipo));
  }

  @Get('facturacion-taller')
  facturacionTaller(
    @Req() req: AuthRequest,
    @Query('bodega') bodega: string,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.facturacionTaller(bodega);
  }

  @Get('facturacion-tecnico')
  facturacionTecnico(
    @Req() req: AuthRequest,
    @Query('bodega') bodega?: string,
    @Query('tecnico') tecnico?: string,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.facturacionTecnico(bodega, tecnico);
  }

  @Get('ordenes-mtto-preventivo')
  ordenesMtto(
    @Req() req: AuthRequest,
    @Query('bodega') bodega: string,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.ordenesMttoPreventivo(bodega);
  }

  @Get('ordenes-tecnicos')
  ordenesTecnicos(
    @Req() req: AuthRequest,
    @Query('bodega') bodega?: string,
    @Query('tecnico') tecnico?: string,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.ordenesTecnicos(bodega, tecnico);
  }

  @Get('tecnicos')
  tecnicos(@Req() req: AuthRequest) {
    assertCodieselEmpresa(req);
    return this.facade.listarTecnicos();
  }

  @Get('nps-fabrica/sedes')
  npsSedes(@Req() req: AuthRequest, @Query('fecha') fecha: string) {
    assertCodieselEmpresa(req);
    return this.facade.npsFabricaSedes(fecha);
  }

  @Get('nps-fabrica/tecnicos')
  npsTecnicos(
    @Req() req: AuthRequest,
    @Query('fecha') fecha: string,
    @Query('sede') sede?: string,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.npsFabricaTecnicos(fecha, sede);
  }
}
