import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../../core/infra/prisma/prisma.module';
import { InformePqrNpsController } from './informe-pqr-nps.controller';
import { PqrNpsPrismaRepository } from './repositories/pqr-nps.prisma.repository';
import { IPqrNpsRepository } from '../domain/pqr-nps.repository';
import { ListarPqrNpsUseCase } from '../application/use-cases/listar-pqr-nps.usecase';
import { PqrNpsFacade } from '../application/pqr-nps.facade';
import { ObtenerGestionPqrNpsUseCase } from '../application/use-cases/obtener-gestion-pqr-nps.usecase';
import { GuardarGestionPqrNpsUseCase } from '../application/use-cases/guardar-gestion-pqr-nps.usecase';
import { CrearPqrUseCase } from '../application/use-cases/crear-pqr.usecase';
import { CrearVerbalizacionUseCase } from '../application/use-cases/crear-verbalizacion.usecase';
import { ListarVerbalizacionesUseCase } from '../application/use-cases/listar-verbalizaciones.usecase';
import { ObtenerClientePorNitUseCase } from '../application/use-cases/obtener-cliente-por-nit.usecase';
import { ObtenerInfoVehiculoUseCase } from '../application/use-cases/obtener-info-vehiculo.usecase';
import { ListarTecnicosPqrNpsUseCase } from '../application/use-cases/listar-tecnicos-pqr-nps.usecase';

@Module({
  imports: [PrismaModule],
  controllers: [InformePqrNpsController],
  providers: [
    {
      provide: IPqrNpsRepository,
      useClass: PqrNpsPrismaRepository,
    },
    ListarPqrNpsUseCase,
    ObtenerGestionPqrNpsUseCase,
    GuardarGestionPqrNpsUseCase,
    CrearPqrUseCase,
    CrearVerbalizacionUseCase,
    ListarVerbalizacionesUseCase,
    ObtenerClientePorNitUseCase,
    ObtenerInfoVehiculoUseCase,
    ListarTecnicosPqrNpsUseCase,
    PqrNpsFacade,
  ],
})
export class InformePqrNpsModule {}
