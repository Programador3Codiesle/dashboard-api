import { Injectable } from '@nestjs/common';
import { IDashboardCommonRepository } from '../../domain/dashboard-common.repository';
import { IMantenimientoDashboardRepository } from '../../domain/mantenimiento.repository';
import { DashboardInformeMtoDto } from '../dto/dashboard-response.dto';

@Injectable()
export class MantenimientoService {
  constructor(
    private readonly commonRepo: IDashboardCommonRepository,
    private readonly mtoRepo: IMantenimientoDashboardRepository,
  ) {}

  async buildInformeMto(
    nitUsuario: number,
    fechaActual: string,
    diaFestivo: number,
    idUsu: string,
  ): Promise<DashboardInformeMtoDto> {
    const sedesRows = await this.commonRepo.getSedesUser(nitUsuario);
    const sedeIds = [
      ...new Set(
        sedesRows
          .map((row) => Number(row.idsede))
          .filter((id) => Number.isFinite(id) && id > 0),
      ),
    ];

    const [
      pendientes,
      proceso,
      finalizadas,
      pendientesPre,
      procesoPre,
      finalizadasPre,
    ] = await Promise.all([
      this.mtoRepo.sPendientes(sedeIds),
      this.mtoRepo.sProceso(sedeIds),
      this.mtoRepo.sFinalizadas(sedeIds),
      this.mtoRepo.sPendientesPre(fechaActual),
      this.mtoRepo.sProcesoPre(fechaActual),
      this.mtoRepo.sFinalizadasPre(fechaActual),
    ]);

    return {
      variant: 'informe_mto',
      fecha_actual: fechaActual,
      dia_festivo: diaFestivo,
      id_usu: idUsu,
      pendientes,
      proceso,
      finalizadas,
      pendientesPre,
      procesoPre,
      finalizadasPre,
    };
  }
}
