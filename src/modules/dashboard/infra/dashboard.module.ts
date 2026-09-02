import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { GetDashboardUseCase } from '../application/use-cases/get-dashboard.usecase';
import {
  DashboardTecnicoPrismaRepository,
  DashboardAsesorRepPrismaRepository,
  DashboardCommonPrismaRepository,
  DashboardJefeTallerPrismaRepository,
  DashboardAdministracionPrismaRepository,
  DashboardAgenteCCPrismaRepository,
  DashboardComprasPrismaRepository,
  DashboardMantenimientoPrismaRepository,
  DashboardGerenciaPrismaRepository,
} from './repositories';
import { JefeTallerService } from '../application/builders/jefe-taller.service';
import { TecnicoService } from '../application/builders/tecnico.service';
import { AdministracionService } from '../application/builders/administracion.service';
import { AgenteContactCenterService } from '../application/builders/agente-contact-center.service';
import { GerenciaService } from '../application/builders/gerencia.service';
import { ComprasService } from '../application/builders/compras.service';
import { AsesorRepuestoService } from '../application/builders/asesor-repuesto.service';
import { MantenimientoService } from '../application/builders/mantenimiento.service';
import { IDashboardCommonRepository } from '../domain/dashboard-common.repository';
import { ITecnicoDashboardRepository } from '../domain/tecnico.repository';
import { IAsesorRepuestoDashboardRepository } from '../domain/asesor-repuesto.repository';
import { IJefeTallerDashboardRepository } from '../domain/jefe-taller.repository';
import { IAdministracionDashboardRepository } from '../domain/administracion.repository';
import { IAgenteCCDashboardRepository } from '../domain/agente-cc.repository';
import { IComprasDashboardRepository } from '../domain/compras.repository';
import { IMantenimientoDashboardRepository } from '../domain/mantenimiento.repository';
import { IGerenciaDashboardRepository } from '../domain/gerencia.repository';

@Module({
  controllers: [DashboardController],
  providers: [
    GetDashboardUseCase,
    // Repositorios especializados
    {
      provide: IDashboardCommonRepository,
      useClass: DashboardCommonPrismaRepository,
    },
    {
      provide: ITecnicoDashboardRepository,
      useClass: DashboardTecnicoPrismaRepository,
    },
    {
      provide: IAsesorRepuestoDashboardRepository,
      useClass: DashboardAsesorRepPrismaRepository,
    },
    {
      provide: IJefeTallerDashboardRepository,
      useClass: DashboardJefeTallerPrismaRepository,
    },
    {
      provide: IAdministracionDashboardRepository,
      useClass: DashboardAdministracionPrismaRepository,
    },
    {
      provide: IAgenteCCDashboardRepository,
      useClass: DashboardAgenteCCPrismaRepository,
    },
    {
      provide: IComprasDashboardRepository,
      useClass: DashboardComprasPrismaRepository,
    },
    {
      provide: IMantenimientoDashboardRepository,
      useClass: DashboardMantenimientoPrismaRepository,
    },
    {
      provide: IGerenciaDashboardRepository,
      useClass: DashboardGerenciaPrismaRepository,
    },
    JefeTallerService,
    TecnicoService,
    AdministracionService,
    AgenteContactCenterService,
    GerenciaService,
    ComprasService,
    AsesorRepuestoService,
    MantenimientoService,
  ],
  exports: [GetDashboardUseCase],
})
export class DashboardModule {}
