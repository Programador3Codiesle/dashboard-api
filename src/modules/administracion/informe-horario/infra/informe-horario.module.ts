import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { InformeHorarioController } from './informe-horario.controller';
import { InformeHorarioFacade } from '../application/informe-horario.facade';
import { ListarInformeHorarioUseCase } from '../application/use-cases/listar-informe-horario.usecase';
import { IInformeHorarioRepository } from '../domain/informe-horario.repository';
import { InformeHorarioPrismaRepository } from './repositories/informe-horario.prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [InformeHorarioController],
  providers: [
    InformeHorarioFacade,
    ListarInformeHorarioUseCase,
    {
      provide: IInformeHorarioRepository,
      useClass: InformeHorarioPrismaRepository,
    },
  ],
})
export class InformeHorarioModule {}
