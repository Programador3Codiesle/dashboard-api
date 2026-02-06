import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { GetDashboardUseCase } from '../application/use-cases/get-dashboard.usecase';
import { IDashboardRepository } from '../domain/dashboard.repository';
import { DashboardPrismaRepository } from './repositories';
import { PrismaService } from '../../../core/infra/prisma/prisma.service';
import { JefeTallerService } from './services/jefe-taller.service';
import { TecnicoService } from './services/tecnico.service';
import { AdministracionService } from './services/administracion.service';
import { AgenteContactCenterService } from './services/agente-contact-center.service';
import { GerenciaService } from './services/gerencia.service';
import { ComprasService } from './services/compras.service';
import { AsesorRepuestoService } from './services/asesor-repuesto.service';
import { MantenimientoService } from './services/mantenimiento.service';

@Module({
  controllers: [DashboardController],
  providers: [
    GetDashboardUseCase,
    { provide: IDashboardRepository, useClass: DashboardPrismaRepository },
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
