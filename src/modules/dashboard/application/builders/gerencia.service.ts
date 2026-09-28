import { Injectable } from '@nestjs/common';
import { DashboardGerenciaDto } from '../dto/dashboard-response.dto';
import { AdministracionService } from './administracion.service';

@Injectable()
export class GerenciaService {
  constructor(private readonly administracionService: AdministracionService) {}

  async buildGerencia(
    nitUsuario: number,
    fechaActual: string,
    diaFestivo: number,
    idUsu: string,
    idEmpresa?: number,
  ): Promise<DashboardGerenciaDto> {
    const admin = await this.administracionService.buildAdmin(
      nitUsuario,
      fechaActual,
      diaFestivo,
      idUsu,
      22,
      idEmpresa,
    );
    return {
      variant: 'gerencia',
      fecha_actual: admin.fecha_actual,
      dia_festivo: admin.dia_festivo,
      id_usu: admin.id_usu,
      informe_posventa: admin.informe_posventa,
    };
  }
}
