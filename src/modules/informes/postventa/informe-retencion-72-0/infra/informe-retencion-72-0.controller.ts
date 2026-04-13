import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../auth/infra/jwt-auth.guard';
import { Retencion720Facade } from '../application/retencion-72-0.facade';
import { Retencion720RowEntity } from '../domain/retencion-72-0.entity';
import { FiltroFamiliaRetencionDto } from '../application/dto/filtro-familia-retencion.dto';
import { PaginacionRetencionQueryDto } from '../application/dto/paginacion-retencion.query';
import {
  ModoComparacion,
  ResumenConComparacionResult,
} from '../application/use-cases/consultas-retencion-72-0.usecase';
import {
  Retencion720FiltroRowEntity,
  Retencion720TablaGeneralRow,
  Retencion720VehiculoRowEntity,
} from '../domain/retencion-72-0.entity';
import { Retencion720Paginated } from '../domain/retencion-72-0.repository';

@UseGuards(JwtAuthGuard)
@Controller('informes/postventa/retencion-72-0')
export class InformeRetencion720Controller {
  constructor(private readonly facade: Retencion720Facade) {}

  @Get()
  obtener(): Promise<Retencion720RowEntity[]> {
    return this.facade.obtenerResumen();
  }

  @Get('segmentos/autos')
  segmentosAutos(): Promise<string[]> {
    return this.facade.listarSegmentosAutos();
  }

  @Get('segmentos/byc')
  segmentosByC(): Promise<string[]> {
    return this.facade.listarSegmentosByC();
  }

  @Get('filtro/autos')
  filtroAutos(
    @Query('filtro') filtro: string,
  ): Promise<Retencion720FiltroRowEntity[]> {
    return this.facade.obtenerFiltroAutos(filtro);
  }

  @Get('filtro/byc')
  filtroByC(
    @Query('filtro') filtro: string,
  ): Promise<Retencion720FiltroRowEntity[]> {
    return this.facade.obtenerFiltroByC(filtro);
  }

  @Get('familias')
  familias(@Query('segmento') segmento: string): Promise<string[]> {
    return this.facade.listarFamiliasPorSegmento(segmento);
  }

  @Post('filtro/familia')
  filtroFamilia(
    @Body() body: FiltroFamiliaRetencionDto,
  ): Promise<Retencion720FiltroRowEntity[]> {
    return this.facade.obtenerPorFamilias(body.segmento, body.familias);
  }

  @Get('comparacion')
  comparacion(
    @Query('modo') modo: ModoComparacion,
    @Query('filtro') filtro: string,
  ): Promise<ResumenConComparacionResult> {
    return this.facade.obtenerResumenConComparacion(modo, filtro);
  }

  @Get('vehiculos/12-meses')
  vehiculos12(
    @Query() q: PaginacionRetencionQueryDto,
  ): Promise<Retencion720Paginated<Retencion720VehiculoRowEntity>> {
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 500;
    return this.facade.listarVehiculos12Meses(page, pageSize);
  }

  @Get('vehiculos/ano-actual')
  vehiculosAno(
    @Query() q: PaginacionRetencionQueryDto,
  ): Promise<Retencion720Paginated<Retencion720VehiculoRowEntity>> {
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 500;
    return this.facade.listarVehiculosAnoActual(page, pageSize);
  }

  @Get('tabla-general')
  tablaGeneral(
    @Query() q: PaginacionRetencionQueryDto,
  ): Promise<Retencion720Paginated<Retencion720TablaGeneralRow>> {
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 500;
    return this.facade.listarTablaGeneralDetalle(page, pageSize);
  }

  @Get('vs/general')
  vsGeneral(): Promise<Retencion720FiltroRowEntity[]> {
    return this.facade.obtenerGrafGeneralVs();
  }

  @Get('vs/autos-byc')
  vsAutosByC(
    @Query('filtro') filtro: string,
  ): Promise<Retencion720FiltroRowEntity[]> {
    return this.facade.obtenerGrafAutosByCVs(filtro);
  }

  @Get('vs/segmento')
  vsSegmento(
    @Query('segmento') segmento: string,
  ): Promise<Retencion720FiltroRowEntity[]> {
    return this.facade.obtenerInfGrafGeneralSegmento(segmento);
  }
}
