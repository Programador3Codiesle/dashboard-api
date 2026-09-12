import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { RankingTrimestralFacade } from '../application/ranking-trimestral.facade';
import { ListarRankingTrimestralUseCase } from '../application/use-cases/listar-ranking-trimestral.usecase';
import { IRankingTrimestralRepository } from '../domain/ranking-trimestral.repository';
import { RankingTrimestralController } from './ranking-trimestral.controller';
import { RankingTrimestralPrismaRepository } from './repositories/ranking-trimestral.prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [RankingTrimestralController],
  providers: [
    {
      provide: IRankingTrimestralRepository,
      useClass: RankingTrimestralPrismaRepository,
    },
    ListarRankingTrimestralUseCase,
    RankingTrimestralFacade,
  ],
})
export class RankingTrimestralModule {}
