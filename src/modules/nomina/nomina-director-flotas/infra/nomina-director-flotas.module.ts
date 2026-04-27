import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { NominaDirectorFlotasController } from './nomina-director-flotas.controller';
import { INominaDirectorFlotasRepository } from '../domain/nomina-director-flotas.repository';
import { NominaDirectorFlotasPrismaRepository } from './repositories/nomina-director-flotas.prisma.repository';
import { ListarNominaDirectorFlotasPrincipalUseCase } from '../application/use-cases/listar-nomina-director-flotas-principal.usecase';
import { ListarNominaDirectorFlotasDetalleUseCase } from '../application/use-cases/listar-nomina-director-flotas-detalle.usecase';
import { NominaDirectorFlotasFacade } from '../application/nomina-director-flotas.facade';

@Module({
  imports: [PrismaModule],
  controllers: [NominaDirectorFlotasController],
  providers: [
    {
      provide: INominaDirectorFlotasRepository,
      useClass: NominaDirectorFlotasPrismaRepository,
    },
    ListarNominaDirectorFlotasPrincipalUseCase,
    ListarNominaDirectorFlotasDetalleUseCase,
    NominaDirectorFlotasFacade,
  ],
})
export class NominaDirectorFlotasModule {}

