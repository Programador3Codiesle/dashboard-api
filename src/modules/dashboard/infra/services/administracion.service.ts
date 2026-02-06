import { Injectable } from '@nestjs/common';
import { IDashboardRepository } from '../../domain/dashboard.repository';
import {
  CENTROS_GIRON,
  CENTROS_ROSITA,
  CENTROS_BARRANCA,
  CENTROS_BOCONO,
  CENTROS_CHEVRO,
  CENTROS_SOLOCH,
  CENTROS_TODOS,
} from '../../domain/dashboard.constants';
import { DashboardAdminDto } from '../../application/dto/dashboard-response.dto';

@Injectable()
export class AdministracionService {
  constructor(private readonly repo: IDashboardRepository) {}

  async buildAdmin(
      nitUsuario: number,
      fechaActual: string,
      diaFestivo: number,
      idUsu: string,
      perfilNum: number,
  ): Promise < DashboardAdminDto > {
      const base: DashboardAdminDto = {
          variant: 'admin',
          fecha_actual: fechaActual,
          dia_festivo: diaFestivo,
          id_usu: idUsu,
      };

      const grafSedes = await this.repo.getGrafSedes();
      base.graf_sedes = grafSedes.length > 0 ? grafSedes : undefined;

      const presuGiron = await this.repo.getPresupuestoMesSedesNew('1,11,9,21');
      const presuBocono = await this.repo.getPresupuestoMesSedesNew('8,14,16,22');
      const presuRosita = await this.repo.getPresupuestoMesSedesNew('7');
      const presuBarranca = await this.repo.getPresupuestoMesSedesNew('6,19');
      const presuSoloc = await this.repo.getPresupuestoMesSedesNew('23');
      const presuChev = await this.repo.getPresupuestoMesSedesNew('4');

      const prin = await this.repo.getPresupuestoDia(CENTROS_GIRON);
      const boc = await this.repo.getPresupuestoDia(CENTROS_BOCONO);
      const ros = await this.repo.getPresupuestoDia(CENTROS_ROSITA);
      const barran = await this.repo.getPresupuestoDia(CENTROS_BARRANCA);
      const solochevr = await this.repo.getPresupuestoDia(CENTROS_SOLOCH);
      const chevrp = await this.repo.getPresupuestoDia(CENTROS_CHEVRO);

      const toDiasMes = await this.repo.getTotalDias();
      const toDiasHoy = await this.repo.getDiasActual();
      const nToDias = toDiasMes?.ultimo_dia ?? 30;
      const nDiasHoy = toDiasHoy?.dia ?? 1;

      const pct = (total: number, presupuesto: number): number =>
          presupuesto > 0 ? Math.round((total / presupuesto) * 10000) / 100 : 0;

      base.porcen_giron = presuGiron ? pct(prin?.total ?? 0, presuGiron.presupuesto) : undefined;
      base.porcen_rosita = presuRosita ? pct(ros?.total ?? 0, presuRosita.presupuesto) : undefined;
      base.porcen_barranca = presuBarranca ? pct(barran?.total ?? 0, presuBarranca.presupuesto) : undefined;
      base.porcen_bocono = presuBocono ? pct(boc?.total ?? 0, presuBocono.presupuesto) : undefined;
      base.porcen_soloc = presuSoloc ? pct(solochevr?.total ?? 0, presuSoloc.presupuesto) : undefined;
      base.porcen_chev = presuChev ? pct(chevrp?.total ?? 0, presuChev.presupuesto) : undefined;

      const toPosvRow = await this.repo.getPresupuestoDia(CENTROS_TODOS);
      base.to_posv = toPosvRow?.total ?? undefined;

      const calPacRows = await this.repo.getCalificacionSedeGeneral();
      base.cal_pac =
          calPacRows.length > 0 && calPacRows[0].Calificacion != null
              ? { Calificacion: calPacRows[0].Calificacion }
              : undefined;

      const inventario = await this.repo.getInformeInventario();
      let valToInv = 0;
      for(const row of inventario) {
          valToInv += (row.Promedio ?? 0) * (row.stock ?? 0);
      }
    base.to_inv = valToInv > 0 ? valToInv : undefined;

      const bodNps = '1,9,11,21,7,6,19,8,14,16,22';
      const npsIntRows = await this.repo.getDataNpsInternoSedes(bodNps);
      let enc0a6 = 0,
      enc7a8 = 0,
      enc9a10 = 0;
      for(const row of npsIntRows) {
          enc0a6 += row.enc0a6 ?? 0;
          enc7a8 += row.enc7a8 ?? 0;
          enc9a10 += row.enc9a10 ?? 0;
      }
    const toEnc = enc0a6 + enc7a8 + enc9a10;
      if(toEnc > 0) {
    base.nps_int = Math.round(((enc9a10 - enc0a6) / toEnc) * 10000) / 100;
}

const dataEstado = await this.repo.getEstadoAgente(nitUsuario);
base.data_estado = dataEstado.length > 0 ? dataEstado : undefined;

return base;
  }
}

