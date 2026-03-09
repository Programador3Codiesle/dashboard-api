import { Body, Controller, Get, Post, Query, Req, StreamableFile, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/infra/jwt-auth.guard';
import { CotizadorFacade } from '../application/cotizador.facade';
import { CrearCotizacionLivianosDTO } from '../application/use-cases/crear-cotizacion-livianos.usecase';
import { CrearCotizacionPesadosDTO } from '../application/use-cases/crear-cotizacion-pesados.usecase';

@UseGuards(JwtAuthGuard)
@Controller('cotizador')
export class CotizadorController {
  constructor(private readonly facade: CotizadorFacade) {}

  @Get('health')
  getHealth() {
    return this.facade.healthCheck();
  }

  @Get('livianos')
  getLivianosInit() {
    return this.facade.getLivianosInitData();
  }

  @Get('pesados')
  getPesadosInit() {
    return this.facade.getPesadosInitData();
  }

  @Get('livianos/vehiculo')
  getVehiculoPorPlaca(@Query('placa') placa: string) {
    return this.facade.getVehiculoPorPlaca(placa);
  }

  @Get('livianos/revisiones')
  getRevisionesLivianos(@Query('clase') clase: string) {
    return this.facade.getRevisionesLivianos(clase);
  }

  @Get('livianos/adicionales-modal')
  getAdicionalesLivianosModal(
    @Query('clase') clase: string,
    @Query('bodega') bodega: string,
    @Query('adicional') adicional: string,
    @Query('year') year: string,
  ) {
    return this.facade.getAdicionalesLivianosModal({
      clase: clase ?? '',
      bodega: Number(bodega),
      adicional: Number(adicional),
      year: Number(year),
    });
  }

  @Get('livianos/detalle')
  getRevisionDetalleLivianos(
    @Query('bodega') bodega: string,
    @Query('clase') clase: string,
    @Query('revision') revision: string,
    @Query('yearModel') yearModel: string,
  ) {
    const bodegaNum = Number(bodega);
    const revisionNum = Number(revision);
    const yearModelNum = Number(yearModel);
    return this.facade.getRevisionDetalleLivianos({
      bodega: bodegaNum,
      clase,
      revision: revisionNum,
      yearModel: yearModelNum,
    });
  }

  @Post('livianos/cotizacion')
  crearCotizacionLivianos(@Req() req: any, @Body() body: CrearCotizacionLivianosDTO) {
    // postv_cotizacion_contact.usuario = id_usuario (sub), no nit (cédula)
    const userId = req.user?.nit != null ? Number(req.user.nit) : null;
    if (userId != null) {
      body.general.usuario = userId;
    }
    return this.facade.crearCotizacionLivianos(body);
  }

  @Post('livianos/posible-retorno')
  crearPosibleRetorno(@Req() req: any, @Body() body: { placa: string; tipo_retorno: number; observacion: string; bodega: number | null }) {
    const userId = req.user?.nit != null ? Number(req.user.nit) : null;
    if (userId == null) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.facade.crearPosibleRetorno(body, userId);
  }

  @Post('livianos/cotizacion/email')
  enviarEmailCotizacionLivianos(
    @Body()
    body: {
      idCotizacion: number;
      placa: string;
      estado: number;
    },
  ) {
    return this.facade.enviarEmailCotizacionLivianos(body.idCotizacion, body.placa, body.estado);
  }

  // Pesados

  @Get('pesados/vehiculo')
  getPesadosInfoClient(@Query('placa') placa: string) {
    return this.facade.getPesadosInfoClient(placa);
  }

  @Get('pesados/mantenimiento')
  getMantenimientoPesados(
    @Query('clase') clase: string,
    @Query('revision') revision: string,
    @Query('bodega') bodega: string,
    @Query('yearModel') yearModel: string,
  ) {
    const revisionNum = Number(revision);
    const bodegaNum = Number(bodega);
    const yearModelNum = Number(yearModel);
    return this.facade.getMantenimientoPesados({
      clase,
      revision: revisionNum,
      bodega: bodegaNum,
      yearModel: yearModelNum,
    });
  }

  @Post('pesados/cotizacion')
  crearCotizacionPesados(@Body() body: CrearCotizacionPesadosDTO) {
    return this.facade.crearCotizacionPesados(body);
  }

  // Informe de cotizaciones

  @Get('informe-cotizaciones/livianos')
  getInformeCotizacionesLivianos(
    @Query('dateStart') dateStart: string,
    @Query('dateEnd') dateEnd: string,
  ) {
    return this.facade.listarCotizacionesLivianos({ dateStart, dateEnd });
  }

  @Get('informe-cotizaciones/pesados')
  getInformeCotizacionesPesados(
    @Query('dateStart') dateStart: string,
    @Query('dateEnd') dateEnd: string,
  ) {
    return this.facade.listarCotizacionesPesados({ dateStart, dateEnd });
  }

  @Post('informe-cotizaciones/email')
  enviarEmailInformeCotizacion(
    @Body()
    body: {
      origen: 'livianos' | 'pesados';
      idCotizacion: number;
      placa: string;
      estado?: number;
      agenda?: boolean;
      empresa?: number;
    },
  ) {
    const estado = body.estado ?? 0;
    const idEmpresa = body.empresa;
    if (body.origen === 'livianos') {
      return this.facade.enviarEmailCotizacionLivianos(body.idCotizacion, body.placa, estado, idEmpresa);
    }
    return this.facade.enviarEmailCotizacionPesados(body.idCotizacion, body.placa, estado, idEmpresa);
  }

  @Post('informe-cotizaciones/agenda')
  actualizarEstadoInformeCotizacion(
    @Body()
    body: {
      origen: 'livianos' | 'pesados';
      idCotizacion: number;
    },
  ) {
    return this.facade.actualizarEstadoCotizacion({
      origen: body.origen === 'pesados' ? 'pesados' : 'livianos',
      idCotizacion: body.idCotizacion,
    });
  }

  @Get('informe-cotizaciones/pdf')
  async getInformeCotizacionPdf(
    @Query('origen') origen: 'livianos' | 'pesados',
    @Query('idCotizacion') idCotizacion: string,
    @Query('placa') placa: string,
    @Query('empresa') empresa?: string,
  ): Promise<StreamableFile> {
    const idNum = Number(idCotizacion);
    const idEmpresa = empresa != null && empresa !== '' ? Number(empresa) : undefined;
    const buffer = await this.facade.generarCotizacionPdf({
      origen: origen === 'pesados' ? 'pesados' : 'livianos',
      idCotizacion: idNum,
      placa,
      idEmpresa,
    });

    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `inline; filename="cotizacion-${idNum}.pdf"`,
    });
  }

  @Get('informe-cotizaciones')
  getInformeCotizacionesPlaceholder() {
    return {
      submodulo: 'informe-cotizaciones',
      status: 'pending',
      message: 'Endpoint de informe de cotizaciones en migración desde legacy.',
    };
  }

  @Get('ejecucion-cotizado-vs-facturado')
  getEjecucionResumen(
    @Query('dateStart') dateStart: string,
    @Query('dateEnd') dateEnd: string,
    @Query('bodega') bodega?: string,
  ) {
    const bodegaNum = bodega ? Number(bodega) : null;
    return this.facade.getEjecucionResumen({ dateStart, dateEnd, bodega: bodegaNum });
  }

  @Get('ejecucion-cotizado-vs-facturado/cotizacion-to-facturado')
  getEjecucionCotizacionToFacturado(
    @Query('dateStart') dateStart: string,
    @Query('dateEnd') dateEnd: string,
    @Query('bodega') bodega?: string,
  ) {
    const bodegaNum = bodega ? Number(bodega) : null;
    return this.facade.getEjecucionCotizacionToFacturado({ dateStart, dateEnd, bodega: bodegaNum });
  }

  @Get('ejecucion-cotizado-vs-facturado/facturado-to-cotizacion')
  getEjecucionFacturadoToCotizacion(
    @Query('dateStart') dateStart: string,
    @Query('dateEnd') dateEnd: string,
    @Query('bodega') bodega?: string,
  ) {
    const bodegaNum = bodega ? Number(bodega) : null;
    return this.facade.getEjecucionFacturadoToCotizacion({ dateStart, dateEnd, bodega: bodegaNum });
  }

  @Get('repuestos-no-disponibles')
  getRepuestosNoDisponibles(
    @Query('dateStart') dateStart: string,
    @Query('dateEnd') dateEnd: string,
    @Query('bodega') bodega?: string,
  ) {
    const bodegaNum = bodega ? Number(bodega) : undefined;
    return this.facade.getRepuestosNoDisponibles({
      dateStart,
      dateEnd,
      bodega: bodegaNum ?? null,
    });
  }

  @Get('control')
  getControlRepuestos() {
    return this.facade.getControlRepuestos();
  }

  @Get('adicionales-livianos')
  getAdicionalesLivianosInit() {
    return this.facade.getAdicionalesLivianosInit();
  }

  @Post('adicionales-livianos/adicional')
  crearAdicionalLiviano(@Body() body: { nombre: string }) {
    return this.facade.crearAdicionalLiviano({ nombre: body.nombre });
  }

  @Post('adicionales-livianos/items')
  cargarAdicionalLiviano(
    @Body()
    body: {
      adicionalId: number;
      clases: string[];
      repuestos: {
        codigo: string;
        descripcion: string;
        cantidad: number;
        yearStart: number;
        yearEnd: number;
        descuento?: number | null;
      }[];
      manoObra: {
        operacion: string;
        tiempo: number;
        valorMenos5: number;
        valorMas5: number;
        descuento?: number | null;
      }[];
    },
  ) {
    return this.facade.cargarAdicionalLiviano(body);
  }

  @Get('adicionales-livianos/items')
  listarAdicionalesLivianos(
    @Query('adicionalId') adicionalId?: string,
    @Query('clases') clasesCsv?: string,
  ) {
    const clases = clasesCsv
      ? clasesCsv.split(',').map((c) => c.trim()).filter(Boolean)
      : [];
    return this.facade.listarAdicionalesLivianos({
      adicionalId: adicionalId ? Number(adicionalId) : undefined,
      clases: clases.length ? clases : undefined,
    });
  }

  @Get('adicionales-pesados')
  getAdicionalesPesadosInit() {
    return this.facade.getAdicionalesPesadosInit();
  }

  @Post('adicionales-pesados/adicional')
  crearAdicionalPesado(@Body() body: { nombre: string }) {
    return this.facade.crearAdicionalPesado({ nombre: body.nombre });
  }

  @Post('adicionales-pesados/items')
  cargarAdicionalPesado(
    @Body()
    body: {
      adicionalId: number;
      clases: string[];
      repuestos: {
        codigo: string;
        descripcion: string;
        cantidad: number;
        yearStart: number;
        yearEnd: number;
        descuento?: number | null;
      }[];
      manoObra: {
        operacion: string;
        tiempo: number;
        valorMenos5: number;
        valorMas5: number;
        descuento?: number | null;
      }[];
    },
  ) {
    return this.facade.cargarAdicionalPesado(body);
  }

  @Get('adicionales-pesados/items')
  listarAdicionalesPesados(
    @Query('adicionalId') adicionalId?: string,
    @Query('clases') clasesCsv?: string,
  ) {
    const clases = clasesCsv
      ? clasesCsv.split(',').map((c) => c.trim()).filter(Boolean)
      : [];
    return this.facade.listarAdicionalesPesados({
      adicionalId: adicionalId ? Number(adicionalId) : undefined,
      clases: clases.length ? clases : undefined,
    });
  }

  // Edición repuesto / mano de obra

  @Get('editar-repuesto-mano-obra/tablas')
  getEdicionTablas() {
    return this.facade.getEdicionTablas();
  }

  @Get('editar-repuesto-mano-obra/clases')
  getEdicionClases(@Query('tablaKey') tablaKey: string) {
    return this.facade.getEdicionClases(tablaKey as any);
  }

  @Post('editar-repuesto-mano-obra/filtro-opciones')
  getEdicionFiltroOpciones(
    @Body()
    body: {
      tablaKey: string;
      filtro: string;
      whereParcial: Record<string, string | number | null | undefined>;
    },
  ) {
    return this.facade.getEdicionFiltroOpciones({
      tablaKey: body.tablaKey as any,
      filtro: body.filtro,
      whereParcial: body.whereParcial ?? {},
    });
  }

  @Post('editar-repuesto-mano-obra/aplicar')
  aplicarEdicionConfig(
    @Body()
    body: {
      tablaKey: string;
      filtros: Record<string, string | number>;
      campos: Record<string, string | number>;
    },
  ) {
    return this.facade.aplicarEdicionConfig({
      tablaKey: body.tablaKey as any,
      filtros: body.filtros ?? {},
      campos: body.campos ?? {},
    });
  }
}

