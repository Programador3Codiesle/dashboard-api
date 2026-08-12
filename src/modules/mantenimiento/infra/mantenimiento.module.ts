import { Module } from '@nestjs/common';
import { EmailModule } from '../../../core/infra/email/email.module';
import { MantenimientoFacade } from '../application/mantenimiento.facade';
import { MANTENIMIENTO_REPOSITORY } from '../domain/mantenimiento.repository';
import { MantenimientoController } from './mantenimiento.controller';
import { MantenimientoPublicController } from './mantenimiento-public.controller';
import { MantenimientoPrismaRepository } from './repositories/mantenimiento.prisma.repository';

@Module({
  imports: [EmailModule],
  controllers: [MantenimientoController, MantenimientoPublicController],
  providers: [
    MantenimientoFacade,
    {
      provide: MANTENIMIENTO_REPOSITORY,
      useClass: MantenimientoPrismaRepository,
    },
  ],
  exports: [MantenimientoFacade],
})
export class MantenimientoModule {}
