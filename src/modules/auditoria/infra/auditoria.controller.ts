import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/infra/jwt-auth.guard';
import { AuditoriaFacade } from '../application/auditoria.facade';
import {
  BodegaOTecnicoQueryDto,
  BodegaQueryDto,
  EntregasQueryDto,
  NpsFabricaSedesQueryDto,
  NpsFabricaTecnicosQueryDto,
  OrdenesDiariasQueryDto,
} from '../application/dto/auditoria-query.dto';
import { CodieselEmpresaGuard } from '../shared/utils/codiesel-empresa.guard';

@Controller('auditoria')
@UseGuards(JwtAuthGuard, CodieselEmpresaGuard)
export class AuditoriaController {
  constructor(private readonly facade: AuditoriaFacade) {}

  @Get('ordenes-diarias')
  ordenesDiarias(@Query() query: OrdenesDiariasQueryDto) {
    return this.facade.ordenesDiarias(query.fecha, query.bodega);
  }

  @Get('entregas')
  entregas(@Query() query: EntregasQueryDto) {
    return this.facade.entregas(query.ano, query.tipo);
  }

  @Get('facturacion-taller')
  facturacionTaller(@Query() query: BodegaQueryDto) {
    return this.facade.facturacionTaller(query.bodega);
  }

  @Get('facturacion-tecnico')
  facturacionTecnico(@Query() query: BodegaOTecnicoQueryDto) {
    return this.facade.facturacionTecnico(query.bodega, query.tecnico);
  }

  @Get('ordenes-mtto-preventivo')
  ordenesMtto(@Query() query: BodegaQueryDto) {
    return this.facade.ordenesMttoPreventivo(query.bodega);
  }

  @Get('ordenes-tecnicos')
  ordenesTecnicos(@Query() query: BodegaOTecnicoQueryDto) {
    return this.facade.ordenesTecnicos(query.bodega, query.tecnico);
  }

  @Get('tecnicos')
  tecnicos() {
    return this.facade.listarTecnicos();
  }

  @Get('nps-fabrica/sedes')
  npsSedes(@Query() query: NpsFabricaSedesQueryDto) {
    return this.facade.npsFabricaSedes(query.fecha);
  }

  @Get('nps-fabrica/tecnicos')
  npsTecnicos(@Query() query: NpsFabricaTecnicosQueryDto) {
    return this.facade.npsFabricaTecnicos(query.fecha, query.sede);
  }
}
