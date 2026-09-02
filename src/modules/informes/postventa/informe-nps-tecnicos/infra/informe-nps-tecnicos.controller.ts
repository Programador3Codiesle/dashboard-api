import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../auth/infra/jwt-auth.guard';
import { NpsTecnicosFacade } from '../application/nps-tecnicos.facade';
import { NpsTecnicoRowEntity } from '../domain/nps-tecnicos.entity';
import { OrigenNpsTecnicos } from '../domain/nps-tecnicos.repository';

@UseGuards(JwtAuthGuard)
@Controller('informes/postventa/nps-tecnicos')
export class InformeNpsTecnicosController {
  constructor(private readonly facade: NpsTecnicosFacade) {}

  @Get()
  listar(
    @Query('origen') origen: OrigenNpsTecnicos,
    @Query('sede') sede: 'todas' | 'giron' | 'rosita' | 'bocono' | 'barranca',
    @Query('mes') mes: string,
  ): Promise<NpsTecnicoRowEntity[]> {
    const mesNumero = Number(mes ?? '0') || 0;

    return this.facade.listar({
      origen,
      sede,
      mes: mesNumero,
    });
  }
}
