import { Injectable } from '@nestjs/common';
import { IDashboardRepository } from '../../domain/dashboard.repository';
import { DashboardComprasDto } from '../../application/dto/dashboard-response.dto';

@Injectable()
export class ComprasService {
  constructor(private readonly repo: IDashboardRepository) {}

  async buildCompras(
      fechaActual: string,
      diaFestivo: number,
      idUsu: string,
  ): Promise < DashboardComprasDto > {
      const pend = await this.repo.getCantSolicitudesCompras('1');
      const proc = await this.repo.getCantSolicitudesCompras('2');
      const fin = await this.repo.getCantSolicitudesCompras('3,4');
      return {
          variant: 'compras',
          fecha_actual: fechaActual,
          dia_festivo: diaFestivo,
          id_usu: idUsu,
          solicitudes_pendientes: pend?.n ?? 0,
          solicitudes_proceso: proc?.n ?? 0,
          solicitudes_finalizadas: fin?.n ?? 0,
      };
    }     
}