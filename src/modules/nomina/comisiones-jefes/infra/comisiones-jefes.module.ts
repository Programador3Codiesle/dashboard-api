import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { ComisionesJefesController } from './comisiones-jefes.controller';
import { ComisionesJefesFacade } from '../application/comisiones-jefes.facade';
import { IComisionesJefesRepository } from '../domain/comisiones-jefes.repository';
import { ComisionesJefesPrismaRepository } from './repositories/comisiones-jefes.prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ComisionesJefesController],
  providers: [
    ComisionesJefesFacade,
    {
      provide: IComisionesJefesRepository,
      useClass: ComisionesJefesPrismaRepository,
    },
  ],
})
export class ComisionesJefesModule {}

