import { Injectable } from '@nestjs/common';
import { IDashboardCommonRepository } from '../../domain/dashboard-common.repository';
import { ITecnicoDashboardRepository } from '../../domain/tecnico.repository';
import { tecnicosSedeSwitch } from '../../domain/dashboard.helpers';
import { DashboardTecnicosDto } from '../dto/dashboard-response.dto';

@Injectable()
export class TecnicoService {
  constructor(
    private readonly commonRepo: IDashboardCommonRepository,
    private readonly tecnicoRepo: ITecnicoDashboardRepository,
  ) {}

  async buildTecnicos(
    nitUsuario: number,
    fechaActual: string,
    diaFestivo: number,
    idUsu: string,
    mesOverride?: number,
    anoOverride?: number,
    idEmpresa?: number,
  ): Promise<DashboardTecnicosDto> {
    const date = await this.commonRepo.getMesAnoActual();
    const mes = mesOverride ?? date?.mes ?? new Date().getMonth() + 1;
    const ano = anoOverride ?? date?.ano ?? new Date().getFullYear();

    const sedesRows = await this.commonRepo.getSedesUser(nitUsuario, idEmpresa);
    const sedesUsu = sedesRows
      .map((r) => r.idsede)
      .join(',')
      .replace(/,\s*$/, '');

    let toRep = 0,
      toMo = 0,
      totalV = 0,
      totalHoras = 0;
    const ventasTec = await this.tecnicoRepo.getVentasTec(nitUsuario, mes, ano);
    if (ventasTec) {
      toMo = ventasTec.MO;
      toRep = ventasTec.rptos;
      totalV = ventasTec.rptos + ventasTec.MO;
      totalHoras = ventasTec.horas_facturadas;
    }

    let npsInt = 0;
    const npsTecRows = await this.tecnicoRepo.getNpsByTecBuscar(
      nitUsuario,
      mes,
      ano,
    );
    for (const key of npsTecRows) {
      const toEnc = (key.enc9a10 ?? 0) + (key.enc0a6 ?? 0) + (key.enc7a8 ?? 0);
      if (toEnc > 0)
        npsInt = (((key.enc9a10 ?? 0) - (key.enc0a6 ?? 0)) / toEnc) * 100;
    }

    let nps = 0;
    const tecnicosNps = await this.tecnicoRepo.getDataNpsByTec(nitUsuario);
    for (const key of tecnicosNps) {
      const totalEncu =
        (key.enc0a6 ?? 0) + (key.enc7a8 ?? 0) + (key.enc9a10 ?? 0);
      if (totalEncu > 0)
        nps = (((key.enc9a10 ?? 0) - (key.enc0a6 ?? 0)) / totalEncu) * 100;
    }

    let ranVendido = 0,
      ranNps = 0;
    const rankVentas = await this.tecnicoRepo.getRankingVentas(sedesUsu);
    const rankNps = await this.tecnicoRepo.getRankingNps(sedesUsu);
    for (const r of rankVentas) {
      if (Number(r.tecnico) === nitUsuario) ranVendido = r.ranking;
    }
    for (const r of rankNps) {
      if (Number(r.tecnico) === nitUsuario) ranNps = r.ranking;
    }

    const switchSede = tecnicosSedeSwitch(sedesUsu);
    const dataRanTec = switchSede.sedesVentasRanking
      ? await this.tecnicoRepo.getVentasTecRanking(
          switchSede.sedesVentasRanking,
          mes,
          ano,
        )
      : [];
    const topeRanPres = switchSede.topeRanPres;

    let ranVendidoSede = 0,
      ranNpsSede = 0;
    const sedesRankVentas = await this.tecnicoRepo.getRankingVentas(
      switchSede.sedesRanking,
    );
    const sedesRankNps = await this.tecnicoRepo.getRankingNps(
      switchSede.sedesRanking,
    );
    for (const r of sedesRankVentas) {
      if (Number(r.tecnico) === nitUsuario) ranVendidoSede = r.ranking;
    }
    for (const r of sedesRankNps) {
      if (Number(r.tecnico) === nitUsuario) ranNpsSede = r.ranking;
    }

    const monthLabels = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    const ventasMensuales: DashboardTecnicosDto['ventas_mensuales'] = [];
    const horasMensuales: DashboardTecnicosDto['horas_mensuales'] = [];
    const npsInternoMensual: DashboardTecnicosDto['nps_interno_mensual'] = [];
    const npsGmMensual: DashboardTecnicosDto['nps_gm_mensual'] = [];

    for (let m = 1; m <= mes; m++) {
      const ventasMes = await this.tecnicoRepo.getVentasTec(nitUsuario, m, ano);
      if (ventasMes) {
        const totalMes = (ventasMes.rptos ?? 0) + (ventasMes.MO ?? 0);
        ventasMensuales?.push({
          mes: monthLabels[m - 1],
          mo: ventasMes.MO ?? 0,
          repuestos: ventasMes.rptos ?? 0,
          total: totalMes,
        });
        horasMensuales?.push({
          mes: monthLabels[m - 1],
          horas: ventasMes.horas_facturadas ?? 0,
        });
      }

      const npsIntRows = await this.tecnicoRepo.getNpsByTecBuscar(
        nitUsuario,
        m,
        ano,
      );
      if (npsIntRows.length > 0) {
        let enc0a6 = 0;
        let enc7a8 = 0;
        let enc9a10 = 0;
        for (const row of npsIntRows) {
          enc0a6 += row.enc0a6 ?? 0;
          enc7a8 += row.enc7a8 ?? 0;
          enc9a10 += row.enc9a10 ?? 0;
        }
        const totalEncuestas = enc0a6 + enc7a8 + enc9a10;
        const npsMes =
          totalEncuestas > 0 ? ((enc9a10 - enc0a6) / totalEncuestas) * 100 : 0;
        npsInternoMensual?.push({
          mes: monthLabels[m - 1],
          nps: Math.round(npsMes * 100) / 100,
        });
      }

      const npsGmRows = await this.tecnicoRepo.getNpsByTecGmGraf(
        nitUsuario,
        m,
        ano,
      );
      if (npsGmRows.length > 0) {
        let enc0a6 = 0;
        let enc7a8 = 0;
        let enc9a10 = 0;
        for (const row of npsGmRows) {
          enc0a6 += row.enc0a6 ?? 0;
          enc7a8 += row.enc7a8 ?? 0;
          enc9a10 += row.enc9a10 ?? 0;
        }
        const totalEncuestas = enc0a6 + enc7a8 + enc9a10;
        const npsMes =
          totalEncuestas > 0 ? ((enc9a10 - enc0a6) / totalEncuestas) * 100 : 0;
        npsGmMensual?.push({
          mes: monthLabels[m - 1],
          nps: Math.round(npsMes * 100) / 100,
        });
      }
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
      ventas_mensuales: ventasMensuales ?? [],
      horas_mensuales: horasMensuales ?? [],
      nps_interno_mensual: npsInternoMensual ?? [],
      nps_gm_mensual: npsGmMensual ?? [],
    };
  }
}
