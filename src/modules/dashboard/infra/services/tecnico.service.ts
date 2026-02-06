import { Injectable } from '@nestjs/common';
import { IDashboardRepository } from '../../domain/dashboard.repository';
import { tecnicosSedeSwitch } from '../../domain/dashboard.helpers';
import { DashboardTecnicosDto } from '../../application/dto/dashboard-response.dto';

@Injectable()
export class TecnicoService {
  constructor(private readonly repo: IDashboardRepository) {}

  async buildTecnicos(
      nitUsuario: number,
      fechaActual: string,
      diaFestivo: number,
      idUsu: string,
  ): Promise < DashboardTecnicosDto > {
      const date = await this.repo.getMesAnoActual();
      const mes = date?.mes ?? new Date().getMonth() + 1;
      const ano = date?.ano ?? new Date().getFullYear();

      const sedesRows = await this.repo.getSedesUser(nitUsuario);
      const sedesUsu = sedesRows.map((r) => r.idsede).join(',').replace(/,\s*$/, '');

      let toRep = 0, toMo = 0, totalV = 0, totalHoras = 0;
      const ventasTec = await this.repo.getVentasTec(nitUsuario, mes, ano);
      if(ventasTec) {
          toMo = ventasTec.MO;
          toRep = ventasTec.rptos;
          totalV = ventasTec.rptos + ventasTec.MO;
          totalHoras = ventasTec.horas_facturadas;
      }

    let npsInt = 0;
      const npsTecRows = await this.repo.getNpsByTecBuscar(nitUsuario, mes, ano);
      for(const key of npsTecRows) {
          const toEnc = (key.enc9a10 ?? 0) + (key.enc0a6 ?? 0) + (key.enc7a8 ?? 0);
          if (toEnc > 0) npsInt = (((key.enc9a10 ?? 0) - (key.enc0a6 ?? 0)) / toEnc) * 100;
      }

    let nps = 0;
      const tecnicosNps = await this.repo.getDataNpsByTec(nitUsuario);
      for(const key of tecnicosNps) {
          const totalEncu = (key.enc0a6 ?? 0) + (key.enc7a8 ?? 0) + (key.enc9a10 ?? 0);
          if (totalEncu > 0) nps = (((key.enc9a10 ?? 0) - (key.enc0a6 ?? 0)) / totalEncu) * 100;
      }

    let ranVendido = 0, ranNps = 0;
      const rankVentas = await this.repo.getRankingVentas(sedesUsu);
      const rankNps = await this.repo.getRankingNps(sedesUsu);
      for(const r of rankVentas) {
          if (Number(r.tecnico) === nitUsuario) ranVendido = r.ranking;
      }
    for(const r of rankNps) {
          if (Number(r.tecnico) === nitUsuario) ranNps = r.ranking;
      }

    const switchSede = tecnicosSedeSwitch(sedesUsu);
      const dataRanTec = switchSede.sedesVentasRanking
          ? await this.repo.getVentasTecRanking(switchSede.sedesVentasRanking, mes, ano)
          : [];
      const topeRanPres = switchSede.topeRanPres;

      let ranVendidoSede = 0, ranNpsSede = 0;
      const sedesRankVentas = await this.repo.getRankingVentas(switchSede.sedesRanking);
      const sedesRankNps = await this.repo.getRankingNps(switchSede.sedesRanking);
      for(const r of sedesRankVentas) {
          if (Number(r.tecnico) === nitUsuario) ranVendidoSede = r.ranking;
      }
    for(const r of sedesRankNps) {
          if (Number(r.tecnico) === nitUsuario) ranNpsSede = r.ranking;
      }

    return {
          variant: 'tecnicos',
          fecha_actual: fechaActual,
          dia_festivo: diaFestivo,
          id_usu: idUsu,
          nps_int: Math.round(npsInt * 100) / 100,
          total_ventas: totalV,
          nps_col: Math.round(nps * 100) / 100,
          horas_fac: totalHoras,
          mo: toMo,
          rep: toRep,
          bod_usu: sedesUsu,
          ranking_talleres: { ran_vendido: ranVendido, ran_nps: ranNps },
          ranking_sedes: { ran_vendido: ranVendidoSede, ran_nps: ranNpsSede },
          ranking_presupuesto: dataRanTec,
          tope_ran_pres: topeRanPres,
      };
  }
}