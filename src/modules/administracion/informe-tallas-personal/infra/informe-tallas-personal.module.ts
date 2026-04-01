import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { InformeTallasPersonalController } from './informe-tallas-personal.controller';
import { TallasPersonalFacade } from '../application/tallas-personal.facade';
import { ListarTallasPersonalUseCase } from '../application/use-cases/listar-tallas-personal.usecase';
import { ITallaPersonalRepository } from '../domain/talla-personal.repository';
import { TallaPersonalPrismaRepository } from './repositories/talla-personal.prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [InformeTallasPersonalController],
  providers: [
    TallasPersonalFacade,
    ListarTallasPersonalUseCase,
    {
      provide: ITallaPersonalRepository,
      useClass: TallaPersonalPrismaRepository,
    },
  ],
})
export class InformeTallasPersonalModule {}

