import { Controller, Get, Query } from '@nestjs/common';
import { PqrNpsFacade } from '../application/pqr-nps.facade';
import { PqrNpsItemEntity } from '../domain/pqr-nps.entity';
import { FiltrosPqrNps } from '../domain/pqr-nps.repository';

@Controller('informes/postventa/pqr-nps')
export class InformePqrNpsController {
  constructor(private readonly facade: PqrNpsFacade) {}

  @Get()
  listar(
    @Query('estado') estado?: 'abiertos' | 'cerrados' | 'todos',
  ): Promise<PqrNpsItemEntity[]> {
    const filtros: FiltrosPqrNps = {
      estado: estado ?? 'abiertos',
    };

    return this.facade.listar(filtros);
  }
}

