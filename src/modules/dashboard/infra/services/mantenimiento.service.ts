import { Injectable } from '@nestjs/common';
import { IDashboardCommonRepository } from '../../domain/dashboard-common.repository';

import { DashboardInformeMtoDto } from '../../application/dto/dashboard-response.dto';

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
    const sedesRows = await this.commonRepo.getSedesUser(nitUsuario, idEmpresa);
    const sedesMto = sedesRows
      .map((r) => r.idsede)
      .join(',')
      .replace(/,\s*$/, '');

    return {
      variant: 'informe_mto',
      fecha_actual: fechaActual,
      dia_festivo: diaFestivo,
      id_usu: idUsu,
    };
  }
}
