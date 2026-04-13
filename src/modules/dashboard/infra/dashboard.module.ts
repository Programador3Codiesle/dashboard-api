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
import { PrismaService } from '../../../core/infra/prisma/prisma.service';
import { JefeTallerService } from './services/jefe-taller.service';
import { TecnicoService } from './services/tecnico.service';
import { AdministracionService } from './services/administracion.service';
import { AgenteContactCenterService } from './services/agente-contact-center.service';
import { GerenciaService } from './services/gerencia.service';
import { ComprasService } from './services/compras.service';
import { AsesorRepuestoService } from './services/asesor-repuesto.service';
import { MantenimientoService } from './services/mantenimiento.service';
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
    PrismaService,
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
