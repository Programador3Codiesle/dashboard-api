import { Module } from '@nestjs/common';
import { CotizadorController } from './cotizador.controller';
import { CotizadorFacade } from '../application/cotizador.facade';
import { GetLivianosInitDataUseCase } from '../application/use-cases/get-livianos-init-data.usecase';
import { GetVehiculoPorPlacaUseCase } from '../application/use-cases/get-vehiculo-por-placa.usecase';
import { GetRevisionesLivianosUseCase } from '../application/use-cases/get-revisiones-livianos.usecase';
import { GetRevisionDetalleLivianosUseCase } from '../application/use-cases/get-revision-detalle-livianos.usecase';
import { CrearCotizacionLivianosUseCase } from '../application/use-cases/crear-cotizacion-livianos.usecase';
import { GetPesadosInitDataUseCase } from '../application/use-cases/get-pesados-init-data.usecase';
import { GetPesadosInfoClientUseCase } from '../application/use-cases/get-pesados-info-client.usecase';
import { GetMantenimientoPesadosUseCase } from '../application/use-cases/get-mantenimiento-pesados.usecase';
import { CrearCotizacionPesadosUseCase } from '../application/use-cases/crear-cotizacion-pesados.usecase';
import { ListarCotizacionesLivianosUseCase } from '../application/use-cases/listar-cotizaciones-livianos.usecase';
import { ListarCotizacionesPesadosUseCase } from '../application/use-cases/listar-cotizaciones-pesados.usecase';
import { GetEjecucionResumenUseCase } from '../application/use-cases/get-ejecucion-resumen.usecase';
import { GetEjecucionCotizacionToFacturadoUseCase } from '../application/use-cases/get-ejecucion-cotizacion-to-facturado.usecase';
import { GetEjecucionFacturadoToCotizacionUseCase } from '../application/use-cases/get-ejecucion-facturado-to-cotizacion.usecase';
import { GetRepuestosNoDisponiblesUseCase } from '../application/use-cases/get-repuestos-no-disponibles.usecase';
import { GetControlRepuestosUseCase } from '../application/use-cases/get-control-repuestos.usecase';
import { GetAdicionalesLivianosInitUseCase } from '../application/use-cases/get-adicionales-livianos-init.usecase';
import { CrearAdicionalLivianosUseCase } from '../application/use-cases/crear-adicional-livianos.usecase';
import { CargarAdicionalLivianosUseCase } from '../application/use-cases/cargar-adicional-livianos.usecase';
import { ListarAdicionalesLivianosUseCase } from '../application/use-cases/listar-adicionales-livianos.usecase';
import { UpdateAdicionalEstadoLivianosUseCase } from '../application/use-cases/update-adicional-estado-livianos.usecase';
import { ValidarCodigoRepuestoUseCase } from '../application/use-cases/validar-codigo-repuesto.usecase';
import { UpdateRepuestoAdicionalLivianosUseCase } from '../application/use-cases/update-repuesto-adicional-livianos.usecase';
import { UpdateManoObraAdicionalLivianosUseCase } from '../application/use-cases/update-mano-obra-adicional-livianos.usecase';
import { DeleteRepuestoAdicionalLivianosUseCase } from '../application/use-cases/delete-repuesto-adicional-livianos.usecase';
import { DeleteManoObraAdicionalLivianosUseCase } from '../application/use-cases/delete-mano-obra-adicional-livianos.usecase';
import { GetAdicionalesPesadosInitUseCase } from '../application/use-cases/get-adicionales-pesados-init.usecase';
import { CrearAdicionalPesadosUseCase } from '../application/use-cases/crear-adicional-pesados.usecase';
import { CargarAdicionalPesadosUseCase } from '../application/use-cases/cargar-adicional-pesados.usecase';
import { ListarAdicionalesPesadosUseCase } from '../application/use-cases/listar-adicionales-pesados.usecase';
import { GetEdicionTablasUseCase } from '../application/use-cases/get-edicion-tablas.usecase';
import { GetEdicionClasesUseCase } from '../application/use-cases/get-edicion-clases.usecase';
import { GetEdicionFiltroOpcionesUseCase } from '../application/use-cases/get-edicion-filtro-opciones.usecase';
import { AplicarEdicionConfigUseCase } from '../application/use-cases/aplicar-edicion-config.usecase';
import { ICotizadorLivianosRepository } from '../domain/cotizador-livianos.repository';
import { CotizadorLivianosPrismaRepository } from './repositories/cotizador-livianos.prisma.repository';
import { ICotizadorPesadosRepository } from '../domain/cotizador-pesados.repository';
import { CotizadorPesadosPrismaRepository } from './repositories/cotizador-pesados.prisma.repository';
import { ICotizadorInformesRepository } from '../domain/cotizador-informes.repository';
import { CotizadorInformesPrismaRepository } from './repositories/cotizador-informes.prisma.repository';
import { ICotizadorEjecucionRepository } from '../domain/cotizador-ejecucion.repository';
import { ICotizadorRepuestosNoDispRepository } from '../domain/cotizador-repuestos-no-disp.repository';
import { ICotizadorControlRepository } from '../domain/cotizador-control.repository';
import { ICotizadorAdicionalesLivianosRepository } from '../domain/cotizador-adicionales-livianos.repository';
import { ICotizadorAdicionalesPesadosRepository } from '../domain/cotizador-adicionales-pesados.repository';
import { ICotizadorEdicionConfigRepository } from '../domain/cotizador-edicion-config.repository';
import { CotizadorEjecucionPrismaRepository } from './repositories/cotizador-ejecucion.prisma.repository';
import { CotizadorRepuestosNoDispPrismaRepository } from './repositories/cotizador-repuestos-no-disp.prisma.repository';
import { CotizadorControlPrismaRepository } from './repositories/cotizador-control.prisma.repository';
import { CotizadorAdicionalesLivianosPrismaRepository } from './repositories/cotizador-adicionales-livianos.prisma.repository';
import { CotizadorAdicionalesPesadosPrismaRepository } from './repositories/cotizador-adicionales-pesados.prisma.repository';
import { CotizadorEdicionConfigPrismaRepository } from './repositories/cotizador-edicion-config.prisma.repository';
import { EmailModule } from '../../../core/infra/email/email.module';
import { EnviarEmailCotizacionLivianosUseCase } from '../application/use-cases/enviar-email-cotizacion-livianos.usecase';
import { EnviarEmailCotizacionPesadosUseCase } from '../application/use-cases/enviar-email-cotizacion-pesados.usecase';
import { CrearPosibleRetornoUseCase } from '../application/use-cases/crear-posible-retorno.usecase';
import { GetAdicionalesLivianosModalUseCase } from '../application/use-cases/get-adicionales-livianos-modal.usecase';
import { ActualizarEstadoCotizacionUseCase } from '../application/use-cases/actualizar-estado-cotizacion.usecase';
import { GenerarCotizacionPdfUseCase } from '../application/use-cases/generar-cotizacion-pdf.usecase';

@Module({
  imports: [EmailModule],
  controllers: [CotizadorController],
  providers: [
    CotizadorFacade,
    // Livianos
    GetLivianosInitDataUseCase,
    GetVehiculoPorPlacaUseCase,
    GetRevisionesLivianosUseCase,
    GetRevisionDetalleLivianosUseCase,
    CrearCotizacionLivianosUseCase,
    {
      provide: ICotizadorLivianosRepository,
      useClass: CotizadorLivianosPrismaRepository,
    },
    // Pesados
    GetPesadosInitDataUseCase,
    GetPesadosInfoClientUseCase,
    GetMantenimientoPesadosUseCase,
    CrearCotizacionPesadosUseCase,
    {
      provide: ICotizadorPesadosRepository,
      useClass: CotizadorPesadosPrismaRepository,
    },
    // Informes
    ListarCotizacionesLivianosUseCase,
    ListarCotizacionesPesadosUseCase,
    {
      provide: ICotizadorInformesRepository,
      useClass: CotizadorInformesPrismaRepository,
    },
    // Ejecución Cotizado vs Facturado
    GetEjecucionResumenUseCase,
    GetEjecucionCotizacionToFacturadoUseCase,
    GetEjecucionFacturadoToCotizacionUseCase,
    {
      provide: ICotizadorEjecucionRepository,
      useClass: CotizadorEjecucionPrismaRepository,
    },
    // Repuestos no disponibles
    GetRepuestosNoDisponiblesUseCase,
    {
      provide: ICotizadorRepuestosNoDispRepository,
      useClass: CotizadorRepuestosNoDispPrismaRepository,
    },
    // Control repuestos
    GetControlRepuestosUseCase,
    {
      provide: ICotizadorControlRepository,
      useClass: CotizadorControlPrismaRepository,
    },
    // Adicionales livianos
    GetAdicionalesLivianosInitUseCase,
    CrearAdicionalLivianosUseCase,
    CargarAdicionalLivianosUseCase,
    ListarAdicionalesLivianosUseCase,
    UpdateAdicionalEstadoLivianosUseCase,
    ValidarCodigoRepuestoUseCase,
    UpdateRepuestoAdicionalLivianosUseCase,
    UpdateManoObraAdicionalLivianosUseCase,
    DeleteRepuestoAdicionalLivianosUseCase,
    DeleteManoObraAdicionalLivianosUseCase,
    {
      provide: ICotizadorAdicionalesLivianosRepository,
      useClass: CotizadorAdicionalesLivianosPrismaRepository,
    },
    // Adicionales pesados
    GetAdicionalesPesadosInitUseCase,
    CrearAdicionalPesadosUseCase,
    CargarAdicionalPesadosUseCase,
    ListarAdicionalesPesadosUseCase,
    {
      provide: ICotizadorAdicionalesPesadosRepository,
      useClass: CotizadorAdicionalesPesadosPrismaRepository,
    },
    // Edición repuesto / mano de obra
    GetEdicionTablasUseCase,
    GetEdicionClasesUseCase,
    GetEdicionFiltroOpcionesUseCase,
    AplicarEdicionConfigUseCase,
    {
      provide: ICotizadorEdicionConfigRepository,
      useClass: CotizadorEdicionConfigPrismaRepository,
    },
    EnviarEmailCotizacionLivianosUseCase,
    EnviarEmailCotizacionPesadosUseCase,
    CrearPosibleRetornoUseCase,
    GetAdicionalesLivianosModalUseCase,
    ActualizarEstadoCotizacionUseCase,
    GenerarCotizacionPdfUseCase,
  ],
  exports: [CotizadorFacade],
})
export class CotizadorModule {}
