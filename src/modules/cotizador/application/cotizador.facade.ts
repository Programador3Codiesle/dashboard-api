import { Injectable } from '@nestjs/common';
import { GetLivianosInitDataUseCase } from './use-cases/get-livianos-init-data.usecase';
import { GetVehiculoPorPlacaUseCase } from './use-cases/get-vehiculo-por-placa.usecase';
import { GetRevisionesLivianosUseCase } from './use-cases/get-revisiones-livianos.usecase';
import {
  GetRevisionDetalleLivianosParams,
  GetRevisionDetalleLivianosUseCase,
} from './use-cases/get-revision-detalle-livianos.usecase';
import {
  CrearCotizacionLivianosDTO,
  CrearCotizacionLivianosUseCase,
} from './use-cases/crear-cotizacion-livianos.usecase';
import { GetPesadosInitDataUseCase } from './use-cases/get-pesados-init-data.usecase';
import { GetPesadosInfoClientUseCase } from './use-cases/get-pesados-info-client.usecase';
import {
  GetMantenimientoPesadosParams,
  GetMantenimientoPesadosUseCase,
} from './use-cases/get-mantenimiento-pesados.usecase';
import {
  CrearCotizacionPesadosDTO,
  CrearCotizacionPesadosUseCase,
} from './use-cases/crear-cotizacion-pesados.usecase';
import {
  ListarCotizacionesLivianosUseCase,
  ListarCotizacionesParams,
} from './use-cases/listar-cotizaciones-livianos.usecase';
import { ListarCotizacionesPesadosUseCase } from './use-cases/listar-cotizaciones-pesados.usecase';
import {
  EjecucionFiltroParams,
  EjecucionResumenResponse,
  GetEjecucionResumenUseCase,
} from './use-cases/get-ejecucion-resumen.usecase';
import { GetEjecucionCotizacionToFacturadoUseCase } from './use-cases/get-ejecucion-cotizacion-to-facturado.usecase';
import { GetEjecucionFacturadoToCotizacionUseCase } from './use-cases/get-ejecucion-facturado-to-cotizacion.usecase';
import { GetRepuestosNoDisponiblesUseCase } from './use-cases/get-repuestos-no-disponibles.usecase';
import { RepuestosNoDisponiblesParams } from './use-cases/get-repuestos-no-disponibles.usecase';
import { GetControlRepuestosUseCase } from './use-cases/get-control-repuestos.usecase';
import {
  AdicionalesPesadosInitResponse,
  GetAdicionalesPesadosInitUseCase,
} from './use-cases/get-adicionales-pesados-init.usecase';
import {
  CrearAdicionalPesadoDTO,
  CrearAdicionalPesadosUseCase,
} from './use-cases/crear-adicional-pesados.usecase';
import {
  CargarAdicionalPesadosDTO,
  CargarAdicionalPesadosUseCase,
} from './use-cases/cargar-adicional-pesados.usecase';
import {
  FiltrosListaAdicionalesPesados,
  ListarAdicionalesPesadosResponse,
  ListarAdicionalesPesadosUseCase,
} from './use-cases/listar-adicionales-pesados.usecase';
import {
  AdicionalesLivianosInitResponse,
  GetAdicionalesLivianosInitUseCase,
} from './use-cases/get-adicionales-livianos-init.usecase';
import {
  CrearAdicionalLivianoDTO,
  CrearAdicionalLivianosUseCase,
} from './use-cases/crear-adicional-livianos.usecase';
import {
  CargarAdicionalLivianosDTO,
  CargarAdicionalLivianosUseCase,
} from './use-cases/cargar-adicional-livianos.usecase';
import {
  FiltrosListaAdicionalesLivianos,
  ListarAdicionalesLivianosResponse,
  ListarAdicionalesLivianosUseCase,
} from './use-cases/listar-adicionales-livianos.usecase';
import { UpdateAdicionalEstadoLivianosUseCase } from './use-cases/update-adicional-estado-livianos.usecase';
import { ValidarCodigoRepuestoUseCase } from './use-cases/validar-codigo-repuesto.usecase';
import { UpdateRepuestoAdicionalLivianosUseCase } from './use-cases/update-repuesto-adicional-livianos.usecase';
import { UpdateManoObraAdicionalLivianosUseCase } from './use-cases/update-mano-obra-adicional-livianos.usecase';
import { DeleteRepuestoAdicionalLivianosUseCase } from './use-cases/delete-repuesto-adicional-livianos.usecase';
import { DeleteManoObraAdicionalLivianosUseCase } from './use-cases/delete-mano-obra-adicional-livianos.usecase';
import { GetEdicionTablasUseCase } from './use-cases/get-edicion-tablas.usecase';
import {
  EdicionClaseOption,
  GetEdicionClasesUseCase,
} from './use-cases/get-edicion-clases.usecase';
import { GetEdicionFiltroOpcionesUseCase } from './use-cases/get-edicion-filtro-opciones.usecase';
import { AplicarEdicionConfigUseCase } from './use-cases/aplicar-edicion-config.usecase';
import {
  AplicarEdicionRequest,
  AplicarEdicionResult,
  FiltroOpcionRequest,
  TablaConfigEntry,
  TablaKeyEdicion,
} from '../domain/cotizador-edicion-config.repository';
import { EnviarEmailCotizacionLivianosUseCase } from './use-cases/enviar-email-cotizacion-livianos.usecase';
import { EnviarEmailCotizacionPesadosUseCase } from './use-cases/enviar-email-cotizacion-pesados.usecase';
import {
  CrearPosibleRetornoDTO,
  CrearPosibleRetornoUseCase,
} from './use-cases/crear-posible-retorno.usecase';
import {
  GetAdicionalesLivianosModalUseCase,
  GetAdicionalesLivianosModalParams,
} from './use-cases/get-adicionales-livianos-modal.usecase';
import {
  ActualizarEstadoCotizacionParams,
  ActualizarEstadoCotizacionUseCase,
} from './use-cases/actualizar-estado-cotizacion.usecase';
import {
  GenerarCotizacionPdfParams,
  GenerarCotizacionPdfUseCase,
} from './use-cases/generar-cotizacion-pdf.usecase';

@Injectable()
export class CotizadorFacade {
  constructor(
    private readonly getLivianosInitDataUC: GetLivianosInitDataUseCase,
    private readonly getVehiculoPorPlacaUC: GetVehiculoPorPlacaUseCase,
    private readonly getRevisionesLivianosUC: GetRevisionesLivianosUseCase,
    private readonly getRevisionDetalleLivianosUC: GetRevisionDetalleLivianosUseCase,
    private readonly crearCotizacionLivianosUC: CrearCotizacionLivianosUseCase,
    private readonly getPesadosInitDataUC: GetPesadosInitDataUseCase,
    private readonly getPesadosInfoClientUC: GetPesadosInfoClientUseCase,
    private readonly getMantenimientoPesadosUC: GetMantenimientoPesadosUseCase,
    private readonly crearCotizacionPesadosUC: CrearCotizacionPesadosUseCase,
    private readonly listarCotizacionesLivianosUC: ListarCotizacionesLivianosUseCase,
    private readonly listarCotizacionesPesadosUC: ListarCotizacionesPesadosUseCase,
    private readonly getEjecucionResumenUC: GetEjecucionResumenUseCase,
    private readonly getEjecucionCotizacionToFacturadoUC: GetEjecucionCotizacionToFacturadoUseCase,
    private readonly getEjecucionFacturadoToCotizacionUC: GetEjecucionFacturadoToCotizacionUseCase,
    private readonly getRepuestosNoDisponiblesUC: GetRepuestosNoDisponiblesUseCase,
    private readonly getControlRepuestosUC: GetControlRepuestosUseCase,
    private readonly getAdicionalesLivianosInitUC: GetAdicionalesLivianosInitUseCase,
    private readonly crearAdicionalLivianosUC: CrearAdicionalLivianosUseCase,
    private readonly cargarAdicionalLivianosUC: CargarAdicionalLivianosUseCase,
    private readonly listarAdicionalesLivianosUC: ListarAdicionalesLivianosUseCase,
    private readonly getAdicionalesPesadosInitUC: GetAdicionalesPesadosInitUseCase,
    private readonly crearAdicionalPesadosUC: CrearAdicionalPesadosUseCase,
    private readonly cargarAdicionalPesadosUC: CargarAdicionalPesadosUseCase,
    private readonly listarAdicionalesPesadosUC: ListarAdicionalesPesadosUseCase,
    private readonly getEdicionTablasUC: GetEdicionTablasUseCase,
    private readonly getEdicionClasesUC: GetEdicionClasesUseCase,
    private readonly getEdicionFiltroOpcionesUC: GetEdicionFiltroOpcionesUseCase,
    private readonly aplicarEdicionConfigUC: AplicarEdicionConfigUseCase,
    private readonly enviarEmailCotizacionLivianosUC: EnviarEmailCotizacionLivianosUseCase,
    private readonly enviarEmailCotizacionPesadosUC: EnviarEmailCotizacionPesadosUseCase,
    private readonly crearPosibleRetornoUC: CrearPosibleRetornoUseCase,
    private readonly getAdicionalesLivianosModalUC: GetAdicionalesLivianosModalUseCase,
    private readonly actualizarEstadoCotizacionUC: ActualizarEstadoCotizacionUseCase,
    private readonly generarCotizacionPdfUC: GenerarCotizacionPdfUseCase,
    private readonly updateAdicionalEstadoLivianosUC: UpdateAdicionalEstadoLivianosUseCase,
    private readonly validarCodigoRepuestoUC: ValidarCodigoRepuestoUseCase,
    private readonly updateRepuestoAdicionalLivianosUC: UpdateRepuestoAdicionalLivianosUseCase,
    private readonly updateManoObraAdicionalLivianosUC: UpdateManoObraAdicionalLivianosUseCase,
    private readonly deleteRepuestoAdicionalLivianosUC: DeleteRepuestoAdicionalLivianosUseCase,
    private readonly deleteManoObraAdicionalLivianosUC: DeleteManoObraAdicionalLivianosUseCase,
  ) {}

  // Punto de entrada único para orquestar los casos de uso del módulo Cotizador.
  // A medida que migremos cada flujo (livianos, pesados, adicionales, informes, etc.)
  // iremos exponiendo métodos específicos desde esta fachada.

  async healthCheck() {
    return {
      modulo: 'cotizador',
      status: 'ok',
      message: 'Módulo Cotizador inicializado. Endpoints en construcción.',
    };
  }

  // Livianos

  async getLivianosInitData() {
    return this.getLivianosInitDataUC.execute();
  }

  async getVehiculoPorPlaca(placa: string, empresaId?: number) {
    return this.getVehiculoPorPlacaUC.execute(placa, empresaId);
  }

  async getRevisionesLivianos(clase: string) {
    return this.getRevisionesLivianosUC.execute(clase);
  }

  async getRevisionDetalleLivianos(params: GetRevisionDetalleLivianosParams) {
    return this.getRevisionDetalleLivianosUC.execute(params);
  }

  async crearCotizacionLivianos(dto: CrearCotizacionLivianosDTO) {
    return this.crearCotizacionLivianosUC.execute(dto);
  }

  async enviarEmailCotizacionLivianos(
    idCotizacion: number,
    placa: string,
    estado: number,
    idEmpresa?: number,
  ) {
    return this.enviarEmailCotizacionLivianosUC.execute({
      idCotizacion,
      placa,
      estado,
      idEmpresa,
    });
  }

  async enviarEmailCotizacionPesados(
    idCotizacion: number,
    placa: string,
    estado: number,
    idEmpresa?: number,
  ) {
    return this.enviarEmailCotizacionPesadosUC.execute({
      idCotizacion,
      placa,
      estado,
      idEmpresa,
    });
  }

  async crearPosibleRetorno(dto: CrearPosibleRetornoDTO, idUsuario: number) {
    return this.crearPosibleRetornoUC.execute(dto, idUsuario);
  }

  async getAdicionalesLivianosModal(params: GetAdicionalesLivianosModalParams) {
    return this.getAdicionalesLivianosModalUC.execute(params);
  }

  // Pesados

  async getPesadosInitData() {
    return this.getPesadosInitDataUC.execute();
  }

  async getPesadosInfoClient(placa: string) {
    return this.getPesadosInfoClientUC.execute(placa);
  }

  async getMantenimientoPesados(params: GetMantenimientoPesadosParams) {
    return this.getMantenimientoPesadosUC.execute(params);
  }

  async crearCotizacionPesados(dto: CrearCotizacionPesadosDTO) {
    return this.crearCotizacionPesadosUC.execute(dto);
  }

  // Informes

  async listarCotizacionesLivianos(params: ListarCotizacionesParams) {
    return this.listarCotizacionesLivianosUC.execute(params);
  }

  async listarCotizacionesPesados(params: ListarCotizacionesParams) {
    return this.listarCotizacionesPesadosUC.execute(params);
  }

  async actualizarEstadoCotizacion(params: ActualizarEstadoCotizacionParams) {
    return this.actualizarEstadoCotizacionUC.execute(params);
  }

  async generarCotizacionPdf(params: GenerarCotizacionPdfParams) {
    return this.generarCotizacionPdfUC.execute(params);
  }

  // Ejecución Cotizado vs Facturado

  async getEjecucionResumen(params: EjecucionFiltroParams): Promise<EjecucionResumenResponse> {
    return this.getEjecucionResumenUC.execute(params);
  }

  async getEjecucionCotizacionToFacturado(params: EjecucionFiltroParams) {
    return this.getEjecucionCotizacionToFacturadoUC.execute(params);
  }

  async getEjecucionFacturadoToCotizacion(params: EjecucionFiltroParams) {
    return this.getEjecucionFacturadoToCotizacionUC.execute(params);
  }

  // Repuestos no disponibles

  async getRepuestosNoDisponibles(params: RepuestosNoDisponiblesParams) {
    return this.getRepuestosNoDisponiblesUC.execute(params);
  }

  // Control repuestos

  async getControlRepuestos() {
    return this.getControlRepuestosUC.execute();
  }

  // Adicionales livianos

  async getAdicionalesLivianosInit(): Promise<AdicionalesLivianosInitResponse> {
    return this.getAdicionalesLivianosInitUC.execute();
  }

  async crearAdicionalLiviano(dto: CrearAdicionalLivianoDTO) {
    return this.crearAdicionalLivianosUC.execute(dto);
  }

  async cargarAdicionalLiviano(dto: CargarAdicionalLivianosDTO) {
    return this.cargarAdicionalLivianosUC.execute(dto);
  }

  async listarAdicionalesLivianos(
    filtros: FiltrosListaAdicionalesLivianos,
  ): Promise<ListarAdicionalesLivianosResponse> {
    return this.listarAdicionalesLivianosUC.execute(filtros);
  }

  async updateAdicionalEstadoLiviano(params: {
    id: number;
    estado: number;
  }): Promise<void> {
    return this.updateAdicionalEstadoLivianosUC.execute(params);
  }

  async validarCodigoRepuesto(codigo: string) {
    return this.validarCodigoRepuestoUC.execute(codigo);
  }

  async updateRepuestoAdicionalLiviano(input: {
    seq: number;
    userId: number;
    descripcion: string;
    cantidad: number;
    yearStart: number;
    yearEnd: number;
    descuento?: number | null;
  }) {
    return this.updateRepuestoAdicionalLivianosUC.execute(input);
  }

  async updateManoObraAdicionalLiviano(input: {
    id: number;
    userId: number;
    operacion: string;
    tiempo: number;
    valorMenos5: number;
    valorMas5: number;
    descuento?: number | null;
  }) {
    return this.updateManoObraAdicionalLivianosUC.execute(input);
  }

  async deleteRepuestoAdicionalLiviano(params: {
    seq: number;
    codigo: string;
    adicionalId: number;
    userId: number;
  }) {
    return this.deleteRepuestoAdicionalLivianosUC.execute(params);
  }

  async deleteManoObraAdicionalLiviano(params: {
    id: number;
    operacion: string;
    adicionalId: number;
    userId: number;
  }) {
    return this.deleteManoObraAdicionalLivianosUC.execute(params);
  }

  // Adicionales pesados

  async getAdicionalesPesadosInit(): Promise<AdicionalesPesadosInitResponse> {
    return this.getAdicionalesPesadosInitUC.execute();
  }

  async crearAdicionalPesado(dto: CrearAdicionalPesadoDTO) {
    return this.crearAdicionalPesadosUC.execute(dto);
  }

  async cargarAdicionalPesado(dto: CargarAdicionalPesadosDTO) {
    return this.cargarAdicionalPesadosUC.execute(dto);
  }

  async listarAdicionalesPesados(
    filtros: FiltrosListaAdicionalesPesados,
  ): Promise<ListarAdicionalesPesadosResponse> {
    return this.listarAdicionalesPesadosUC.execute(filtros);
  }

  // Edición repuesto / mano de obra

  async getEdicionTablas(): Promise<TablaConfigEntry[]> {
    return this.getEdicionTablasUC.execute();
  }

  async getEdicionClases(
    tablaKey: TablaKeyEdicion,
  ): Promise<EdicionClaseOption[]> {
    return this.getEdicionClasesUC.execute(tablaKey);
  }

  async getEdicionFiltroOpciones(
    req: FiltroOpcionRequest,
  ): Promise<string[]> {
    return this.getEdicionFiltroOpcionesUC.execute(req);
  }

  async aplicarEdicionConfig(
    req: AplicarEdicionRequest,
  ): Promise<AplicarEdicionResult> {
    return this.aplicarEdicionConfigUC.execute(req);
  }
}

