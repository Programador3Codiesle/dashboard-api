import { Module } from '@nestjs/common';
import { EmailModule } from '../../../core/infra/email/email.module';
import { MantenimientoFacade } from '../application/mantenimiento.facade';
import { CatalogosUseCase } from '../application/use-cases/catalogos.usecase';
import {
  AgregarMensajeUseCase,
  CrearSolicitudUseCase,
  FinalizarSolicitudUseCase,
  GetSolicitudUseCase,
  IniciarSolicitudUseCase,
  ListarCorrectivoUseCase,
  ListarMensajesUseCase,
  UpdateEquipoSolicitudUseCase,
} from '../application/use-cases/correctivo.usecase';
import {
  ActualizarEquipoUseCase,
  CrearEquipoUseCase,
  GetHojaVidaUseCase,
  HistorialEquipoUseCase,
  UpdateHojaVidaUseCase,
} from '../application/use-cases/gestionar-equipo.usecase';
import {
  InformeCorrectivoUseCase,
  InformePreventivoUseCase,
} from '../application/use-cases/informes.usecase';
import {
  GetEquipoUseCase,
  ListarEquiposUseCase,
  NombresFamiliaUseCase,
} from '../application/use-cases/listar-equipos.usecase';
import {
  EliminarOrdenUseCase,
  EventosPreventivoUseCase,
  FinalizarOrdenUseCase,
  GetOrdenPreventivoUseCase,
  IniciarOrdenUseCase,
  ListadoPreventivoUseCase,
  UpdateFechaOrdenUseCase,
  UploadCronogramaUseCase,
} from '../application/use-cases/preventivo.usecase';
import {
  OrdenPreventivoDesdeEquipoUseCase,
  SolicitarRetiroUseCase,
} from '../application/use-cases/retiro-orden-equipo.usecase';
import {
  AutorizarRetiroPublicoUseCase,
  RechazarRetiroPublicoUseCase,
} from '../application/use-cases/retiro-publico.usecase';
import { IMantenimientoRepository } from '../domain/mantenimiento.repository';
import { MantenimientoController } from './mantenimiento.controller';
import { MantenimientoPublicController } from './mantenimiento-public.controller';
import { CodieselEmpresaGuard } from '../shared/utils/codiesel-empresa.guard';
import { MantenimientoPrismaRepository } from './repositories/mantenimiento.prisma.repository';

const USE_CASES = [
  CatalogosUseCase,
  ListarEquiposUseCase,
  NombresFamiliaUseCase,
  GetEquipoUseCase,
  CrearEquipoUseCase,
  ActualizarEquipoUseCase,
  GetHojaVidaUseCase,
  UpdateHojaVidaUseCase,
  HistorialEquipoUseCase,
  OrdenPreventivoDesdeEquipoUseCase,
  SolicitarRetiroUseCase,
  AutorizarRetiroPublicoUseCase,
  RechazarRetiroPublicoUseCase,
  ListarCorrectivoUseCase,
  CrearSolicitudUseCase,
  IniciarSolicitudUseCase,
  FinalizarSolicitudUseCase,
  GetSolicitudUseCase,
  ListarMensajesUseCase,
  AgregarMensajeUseCase,
  UpdateEquipoSolicitudUseCase,
  EventosPreventivoUseCase,
  ListadoPreventivoUseCase,
  GetOrdenPreventivoUseCase,
  IniciarOrdenUseCase,
  FinalizarOrdenUseCase,
  EliminarOrdenUseCase,
  UpdateFechaOrdenUseCase,
  UploadCronogramaUseCase,
  InformePreventivoUseCase,
  InformeCorrectivoUseCase,
];

@Module({
  imports: [EmailModule],
  controllers: [MantenimientoController, MantenimientoPublicController],
  providers: [
    MantenimientoFacade,
    CodieselEmpresaGuard,
    ...USE_CASES,
    {
      provide: IMantenimientoRepository,
      useClass: MantenimientoPrismaRepository,
    },
  ],
  exports: [MantenimientoFacade],
})
export class MantenimientoModule {}
