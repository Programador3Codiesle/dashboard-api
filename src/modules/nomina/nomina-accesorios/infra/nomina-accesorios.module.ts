import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { NominaAccesoriosController } from './nomina-accesorios.controller';
import { INominaAccesoriosRepository } from '../domain/nomina-accesorios.repository';
import { NominaAccesoriosPrismaRepository } from './repositories/nomina-accesorios.prisma.repository';
import { ListarNominaAccesoriosUseCase } from '../application/use-cases/listar-nomina-accesorios.usecase';
import { NominaAccesoriosFacade } from '../application/nomina-accesorios.facade';

@Module({
  imports: [PrismaModule],
  controllers: [NominaAccesoriosController],
  providers: [
    {
      provide: INominaAccesoriosRepository,
      useClass: NominaAccesoriosPrismaRepository,
    },
    ListarNominaAccesoriosUseCase,
    NominaAccesoriosFacade,
  ],
})
export class NominaAccesoriosModule {}
