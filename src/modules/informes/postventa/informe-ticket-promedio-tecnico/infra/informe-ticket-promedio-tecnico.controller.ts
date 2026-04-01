import { Controller, Get, Query } from '@nestjs/common';
import { TicketPromedioTecnicoFacade } from '../application/ticket-promedio-tecnico.facade';

@Controller('informes/postventa/ticket-promedio-tecnico')
export class InformeTicketPromedioTecnicoController {
  constructor(
    private readonly ticketPromedioTecnicoFacade: TicketPromedioTecnicoFacade,
  ) {}

  @Get()
  async obtener(
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('patio') patio: string,
  ) {
    const parsedYear = Number(year);
    const parsedMonth = Number(month);

    if (!parsedYear || !parsedMonth) {
      throw new Error('Parámetros year y month son obligatorios y numéricos.');
    }

    const filtros = {
      year: parsedYear,
      month: parsedMonth,
      patio: patio ?? 'all',
    };

    return this.ticketPromedioTecnicoFacade.obtenerTicketPromedio(filtros);
  }
}

