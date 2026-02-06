import { Injectable } from '@nestjs/common';
import { DashboardGerenciaDto } from '../../application/dto/dashboard-response.dto';
import { AdministracionService } from './administracion.service';

@Injectable()
export class GerenciaService {
  constructor(private readonly administracionService: AdministracionService) {}

  async buildGerencia(
    nitUsuario: number,
    fechaActual: string,
    diaFestivo: number,
    idUsu: string,
  ): Promise<DashboardGerenciaDto> {
    const admin = await this.administracionService.buildAdmin(
      nitUsuario,
      fechaActual,
      diaFestivo,
      idUsu,
      22,
    );
      return {
          variant: 'gerencia',
          fecha_actual: admin.fecha_actual,
          dia_festivo: admin.dia_festivo,
          id_usu: admin.id_usu,
          graf_sedes: admin.graf_sedes,
          porcen_giron: admin.porcen_giron,
          porcen_rosita: admin.porcen_rosita,
          porcen_barranca: admin.porcen_barranca,
          porcen_bocono: admin.porcen_bocono,
          porcen_soloc: admin.porcen_soloc,
          porcen_chev: admin.porcen_chev,
          to_posv: admin.to_posv,
          cal_pac: admin.cal_pac,
          to_inv: admin.to_inv,
          nps_int: admin.nps_int,
      };
    }
}