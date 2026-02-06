import { Injectable } from '@nestjs/common';
import { IDashboardRepository } from '../../domain/dashboard.repository';
import { DashboardInformeMtoDto } from '../../application/dto/dashboard-response.dto';

@Injectable()
export class MantenimientoService {
  constructor(private readonly repo: IDashboardRepository) {}

  async buildInformeMto(
    nitUsuario: number,
    fechaActual: string,
    diaFestivo: number,
    idUsu: string,
  ): Promise<DashboardInformeMtoDto> {
    const sedesRows = await this.repo.getSedesUser(nitUsuario);
    const sedesMto = sedesRows
      .map((r) => r.idsede)
      .join(',')
      .replace(/,\s*$/, '');
    const pend = await this.repo.sPendientes(sedesMto);
    const proc = await this.repo.sProceso(sedesMto);
    const fin = await this.repo.sFinalizadas(sedesMto);
    const prePend = await this.repo.sPendientesPre();
    const preProc = await this.repo.sProcesoPre();
    const preFin = await this.repo.sFinalizadasPre();
    return {
      variant: 'informe_mto',
      fecha_actual: fechaActual,
      dia_festivo: diaFestivo,
      id_usu: idUsu,
      pendientes: pend?.pendientes ?? 0,
      proceso: proc?.proceso ?? 0,
      finalizadas: fin?.finalizada ?? 0,
      pendientesPre: prePend?.pendientes ?? 0,
      procesoPre: preProc?.proceso ?? 0,
      finalizadasPre: preFin?.finalizada ?? 0,
    };
  }
}
