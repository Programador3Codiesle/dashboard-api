import { Module } from '@nestjs/common';
import { AuditoriaFacade } from '../application/auditoria.facade';
import { EntregasUseCase } from '../application/use-cases/entregas.usecase';
import { FacturacionTallerUseCase } from '../application/use-cases/facturacion-taller.usecase';
import { FacturacionTecnicoUseCase } from '../application/use-cases/facturacion-tecnico.usecase';
import { ListarTecnicosUseCase } from '../application/use-cases/listar-tecnicos.usecase';
import { NpsFabricaSedesUseCase } from '../application/use-cases/nps-fabrica-sedes.usecase';
import { NpsFabricaTecnicosUseCase } from '../application/use-cases/nps-fabrica-tecnicos.usecase';
import { OrdenesDiariasUseCase } from '../application/use-cases/ordenes-diarias.usecase';
import { OrdenesMttoPreventivoUseCase } from '../application/use-cases/ordenes-mtto-preventivo.usecase';
import { OrdenesTecnicosUseCase } from '../application/use-cases/ordenes-tecnicos.usecase';
import { IAuditoriaRepository } from '../domain/auditoria.repository';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaPrismaRepository } from './repositories/auditoria.prisma.repository';

@Module({
  controllers: [AuditoriaController],
  providers: [
    AuditoriaFacade,
    OrdenesDiariasUseCase,
    EntregasUseCase,
    FacturacionTallerUseCase,
    FacturacionTecnicoUseCase,
    OrdenesMttoPreventivoUseCase,
    OrdenesTecnicosUseCase,
    ListarTecnicosUseCase,
    NpsFabricaSedesUseCase,
    NpsFabricaTecnicosUseCase,
    {
      provide: IAuditoriaRepository,
      useClass: AuditoriaPrismaRepository,
    },
  ],
  exports: [AuditoriaFacade],
})
export class AuditoriaModule {}
