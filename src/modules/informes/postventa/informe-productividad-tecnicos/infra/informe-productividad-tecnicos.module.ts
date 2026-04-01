import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../../core/infra/prisma/prisma.module';
import { InformeProductividadTecnicosController } from './informe-productividad-tecnicos.controller';
import { IProductividadTecnicosRepository } from '../domain/productividad-tecnicos.repository';
import { ProductividadTecnicosPrismaRepository } from './repositories/productividad-tecnicos.prisma.repository';
import { ObtenerProductividadTecnicosUseCase } from '../application/use-cases/obtener-productividad-tecnicos.usecase';
import { ProductividadTecnicosFacade } from '../application/productividad-tecnicos.facade';

@Module({
  imports: [PrismaModule],
  controllers: [InformeProductividadTecnicosController],
  providers: [
    {
      provide: IProductividadTecnicosRepository,
      useClass: ProductividadTecnicosPrismaRepository,
    },
    ObtenerProductividadTecnicosUseCase,
    ProductividadTecnicosFacade,
  ],
})
export class InformeProductividadTecnicosModule {}

