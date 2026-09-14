import { Injectable } from '@nestjs/common';

import { IAgenteCCDashboardRepository } from '../../domain/agente-cc.repository';
import { DashboardAgenteCCDto } from '../dto/dashboard-response.dto';

@Injectable()
export class AgenteContactCenterService {
  constructor(private readonly agenteCCRepo: IAgenteCCDashboardRepository) {}

  async buildAgenteCC(
    nitUsuario: number,
    fechaActual: string,
    diaFestivo: number,
    idUsu: string,
  ): Promise<DashboardAgenteCCDto> {
    const dataEstado = await this.agenteCCRepo.getEstadoAgente(nitUsuario);
    return {
      variant: 'agente_cc',
      fecha_actual: fechaActual,
      dia_festivo: diaFestivo,
      id_usu: idUsu,
      data_estado: dataEstado.length > 0 ? dataEstado : undefined,
    };
  }
}
