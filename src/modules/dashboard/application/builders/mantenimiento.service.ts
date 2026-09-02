import { Injectable } from '@nestjs/common';
import { IDashboardCommonRepository } from '../../domain/dashboard-common.repository';

import { DashboardInformeMtoDto } from '../dto/dashboard-response.dto';

@Injectable()
export class MantenimientoService {
  constructor(private readonly commonRepo: IDashboardCommonRepository) {}

  async buildInformeMto(
    nitUsuario: number,
    fechaActual: string,
    diaFestivo: number,
    idUsu: string,
    idEmpresa?: number,
  ): Promise<DashboardInformeMtoDto> {
    await this.commonRepo.getSedesUser(nitUsuario, idEmpresa);

    return {
      variant: 'informe_mto',
      fecha_actual: fechaActual,
      dia_festivo: diaFestivo,
      id_usu: idUsu,
    };
  }
}
