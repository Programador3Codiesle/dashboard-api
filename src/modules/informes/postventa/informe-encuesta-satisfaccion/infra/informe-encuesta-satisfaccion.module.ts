import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../../core/infra/prisma/prisma.module';
import { InformeEncuestaSatisfaccionController } from './informe-encuesta-satisfaccion.controller';
import { EncuestaSatisfaccionPrismaRepository } from './repositories/encuesta-satisfaccion.prisma.repository';
import { IEncuestaSatisfaccionRepository } from '../domain/encuesta-satisfaccion.repository';
import { ListarEncuestaSatisfaccionUseCase } from '../application/use-cases/listar-encuesta-satisfaccion.usecase';
import { EncuestaSatisfaccionFacade } from '../application/encuesta-satisfaccion.facade';

@Module({
  imports: [PrismaModule],
  controllers: [InformeEncuestaSatisfaccionController],
  providers: [
    {
      provide: IEncuestaSatisfaccionRepository,
      useClass: EncuestaSatisfaccionPrismaRepository,
    },
    ListarEncuestaSatisfaccionUseCase,
    EncuestaSatisfaccionFacade,
  ],
})
export class InformeEncuestaSatisfaccionModule {}
