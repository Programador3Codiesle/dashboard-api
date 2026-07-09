import { Module } from '@nestjs/common';
import { IPresupuestoRepository } from '../domain/repositories/presupuesto.repository.interface';
import { PresupuestoFacade } from '../application/presupuesto.facade';
import { ActualizarPresupuestoUseCase } from '../application/use-cases/actualizar-presupuesto.use-case';
import { ConsultarPresupuestoUseCase } from '../application/use-cases/consultar-presupuesto.use-case';
import { ObtenerCatalogosPresupuestoUseCase } from '../application/use-cases/obtener-catalogos.use-case';
import { PresupuestoController } from './presupuesto.controller';
import { PresupuestoPrismaRepository } from './repositories/presupuesto.prisma.repository';

@Module({
  controllers: [PresupuestoController],
  providers: [
    {
      provide: IPresupuestoRepository,
      useClass: PresupuestoPrismaRepository,
    },
    ObtenerCatalogosPresupuestoUseCase,
    ConsultarPresupuestoUseCase,
    ActualizarPresupuestoUseCase,
    PresupuestoFacade,
  ],
})
export class PresupuestoModule {}
