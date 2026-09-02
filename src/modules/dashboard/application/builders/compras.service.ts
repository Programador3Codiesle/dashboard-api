import { Injectable } from '@nestjs/common';
import { IComprasDashboardRepository } from '../../domain/compras.repository';
import { DashboardComprasDto } from '../dto/dashboard-response.dto';

@Injectable()
export class ComprasService {
  constructor(private readonly comprasRepo: IComprasDashboardRepository) {}

  async buildCompras(
    fechaActual: string,
    diaFestivo: number,
    idUsu: string,
  ): Promise<DashboardComprasDto> {
    const pend = await this.comprasRepo.getCantSolicitudesCompras('1');
    const proc = await this.comprasRepo.getCantSolicitudesCompras('2');
    const fin = await this.comprasRepo.getCantSolicitudesCompras('3,4');
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
