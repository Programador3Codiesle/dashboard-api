import { Module } from '@nestjs/common';
import { ControlVehiculoController } from './ControlVehiculoController';
import { ControlVehiculoFacade } from '../application/control-vehiculo.facade';
import { RegistrarSalidaUseCase } from '../application/use-cases/registrar-salida.usecase';
import { RegistrarLlegadaUseCase } from '../application/use-cases/registrar-llegada.usecase';
import { ListarVehiculosUseCase } from '../application/use-cases/listar-vehiculos.usecase';
import { VehiculosModelosUseCase } from '../application/use-cases/vehiculos-modelos.use';
import { IControlVehiculoRepository } from '../domain/control-vehiculo.repository';
import { ControlVehiculoPrismaRepository } from './repositories/control-vehiculo.prisma.repository';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import { ControlVehiculoMapper } from '../presentation/mappers/control-vehiculo.mapper';

@Module({
    controllers: [ControlVehiculoController],
    providers: [
        ControlVehiculoFacade,
        RegistrarSalidaUseCase,
        RegistrarLlegadaUseCase,
        ListarVehiculosUseCase,
        VehiculosModelosUseCase,
        { provide: IControlVehiculoRepository, useClass: ControlVehiculoPrismaRepository },
        PrismaService,
        // Mappers
        ControlVehiculoMapper
    ],
    exports: [ControlVehiculoFacade]
})
export class ControlVehiculoModule { }
