import { Injectable } from '@nestjs/common';

import { DashboardAgenteCCDto } from '../../application/dto/dashboard-response.dto';

@Injectable()
export class AgenteContactCenterService {
  constructor(
   
  ) {}

  async buildAgenteCC(
      nitUsuario: number,
      fechaActual: string,
      diaFestivo: number,
      idUsu: string,
  ): Promise < DashboardAgenteCCDto > {
    const dataEstado: Array<{ estado: string }> = [];
      return {
          variant: 'agente_cc',
          fecha_actual: fechaActual,
          dia_festivo: diaFestivo,
          id_usu: idUsu,
          data_estado: dataEstado.length > 0 ? dataEstado : undefined,
      };
    }
}