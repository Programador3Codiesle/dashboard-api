import { Injectable } from '@nestjs/common';

import { DashboardAgenteCCDto } from '../dto/dashboard-response.dto';

@Injectable()
export class AgenteContactCenterService {
  buildAgenteCC(
    nitUsuario: number,
    fechaActual: string,
    diaFestivo: number,
    idUsu: string,
  ): Promise<DashboardAgenteCCDto> {
    const dataEstado: Array<{ estado: string }> = [];
    return Promise.resolve({
      variant: 'agente_cc',
      fecha_actual: fechaActual,
      dia_festivo: diaFestivo,
      id_usu: idUsu,
      data_estado: dataEstado.length > 0 ? dataEstado : undefined,
    });
  }
}
