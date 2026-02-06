import { Injectable } from '@nestjs/common';
import { IDashboardRepository } from '../../domain/dashboard.repository';
import { DashboardAgenteCCDto } from '../../application/dto/dashboard-response.dto';

@Injectable()
export class AgenteContactCenterService {
  constructor(private readonly repo: IDashboardRepository) {}

  async buildAgenteCC(
      nitUsuario: number,
      fechaActual: string,
      diaFestivo: number,
      idUsu: string,
  ): Promise < DashboardAgenteCCDto > {
      const dataEstado = await this.repo.getEstadoAgente(nitUsuario);
      return {
          variant: 'agente_cc',
          fecha_actual: fechaActual,
          dia_festivo: diaFestivo,
          id_usu: idUsu,
          data_estado: dataEstado.length > 0 ? dataEstado : undefined,
      };
    }
}