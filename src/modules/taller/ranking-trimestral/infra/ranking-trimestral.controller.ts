import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { RankingTrimestralFacade } from '../application/ranking-trimestral.facade';
import { RankingTrimestralQueryDto } from '../application/dto/ranking-trimestral-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('taller/ranking-trimestral')
export class RankingTrimestralController {
  constructor(private readonly facade: RankingTrimestralFacade) {}

  @Get()
  listar(@Query() query: RankingTrimestralQueryDto) {
    return this.facade.execute(query.ano, query.trimestre);
  }
}
