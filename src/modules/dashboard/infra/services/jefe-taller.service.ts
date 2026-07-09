import { Injectable } from '@nestjs/common';
import { IDashboardCommonRepository } from '../../domain/dashboard-common.repository';
import {
  mapSedesToSedeName,
  mapSedeIdToSedeNameGm,
} from '../../domain/dashboard.helpers';
import {
  DashboardJefeTallerDto,
  JefeTallerSedeDto,
  DataPointDto,
} from '../../application/dto/dashboard-response.dto';

const MESES_NOM = [
  '',
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

@Injectable()
export class JefeTallerService {
  constructor(private readonly commonRepo: IDashboardCommonRepository) {}

  async buildJefeTaller(
    nitUsuario: number,
    fechaActual: string,
    diaFestivo: number,
    idUsu: string,
    idEmpresa?: number,
  ): Promise<DashboardJefeTallerDto> {
    const date = await this.commonRepo.getMesAnoActual();
    const sedesRows = await this.commonRepo.getSedesUser(nitUsuario, idEmpresa);
    const mes = date?.mes ?? new Date().getMonth() + 1;
    const ano = date?.ano ?? new Date().getFullYear();
    const sedesIds = sedesRows.map((r) => r.idsede).join(', ');
    const sedesUsu = sedesIds.trim() ? sedesIds.replace(/,\s*$/, '') : '';

    let toRep = 0,
      toMo = 0,
      toTot = 0,
      totalV = 0,
      totalHoras = 0;
    const ventasBod = await this.commonRepo.getVentasBod(sedesUsu, mes, ano);
    const npsRows = await this.commonRepo.getDataNpsInternoSedesMes(sedesUsu);
    if (ventasBod) {
      toMo = ventasBod.MO;
      toRep = ventasBod.rptos;
      toTot = ventasBod.TOT;
      totalV = ventasBod.rptos + ventasBod.MO + ventasBod.TOT;
      totalHoras = ventasBod.horas_facturadas;
    }

    let npsInt = 0;
    for (const key of npsRows) {
      const toEnc = (key.enc9a10 ?? 0) + (key.enc0a6 ?? 0) + (key.enc7a8 ?? 0);
      if (toEnc > 0) {
        npsInt = (((key.enc9a10 ?? 0) - (key.enc0a6 ?? 0)) / toEnc) * 100;
      }
    }

    const sedeName = mapSedesToSedeName(sedesUsu);
    let nps = 0;
    if (sedeName) {
      const npsSedeRows = await this.commonRepo.getCalificacionSede(sedeName);
      for (const key of npsSedeRows) {
        const totalEncu =
          (key.Enc_0_a_6 ?? 0) + (key.Enc_7_a_8 ?? 0) + (key.Enc_9_a_10 ?? 0);
        if (totalEncu > 0) {
          nps =
            (((key.Enc_9_a_10 ?? 0) - (key.Enc_0_a_6 ?? 0)) / totalEncu) * 100;
        }
      }
    }

    /*
    const dataBodegas = await this.commonRepo.getVentasBodDetalle(
      sedesUsu,
      mes,
      ano,
    );
    */
    const sedes: JefeTallerSedeDto[] = [];
    for (const row of sedesRows) {
      const idsede = row.idsede;
      const nombreSede = row.descripcion ?? String(idsede);
      const dataPoints1: DataPointDto[] = [];
      const dataPoints2: DataPointDto[] = [];
      const dataPoints3: DataPointDto[] = [];
      const dataPoints4: DataPointDto[] = [];
      const dataPoints5: DataPointDto[] = [];
      const dataPoints6: DataPointDto[] = [];
      const dataPoints7: DataPointDto[] = [];
      const objetiveNps: DataPointDto[] = [];
      const objetiveNpsGM: DataPointDto[] = [];

      let totalVentaManoObraCurrent = 0;
      let totalVentaRepuestoCurrent = 0;
      let totalVentaTotCurrent = 0;
      let totalVentaCurrent = 0;
      let totalHorasCurrent = 0;
      let objectiveNpsIntCurrent = 0;
      let objectiveNpsGMIntCurrent = 0;

      const sedeNameGm = mapSedeIdToSedeNameGm(idsede);

      const monthIndices = Array.from({ length: mes }, (_, i) => mes - i);
      const monthBlocks: Array<{
        m: number;
        mesNom: string;
        ventasGraf: Awaited<
          ReturnType<IDashboardCommonRepository['getVentasBodGraf']>
        >;
        npsIntGraf: Awaited<
          ReturnType<IDashboardCommonRepository['getNpsIntBodGraf']>
        >;
        npsGmGraf: Awaited<
          ReturnType<IDashboardCommonRepository['getNpsByBodGmGraf']>
        > | null;
      }> = [];
      for (const m of monthIndices) {
        const mesNom = m >= 1 && m <= 12 ? MESES_NOM[m] : '';
        const ventasGraf = await this.commonRepo.getVentasBodGraf(
          idsede,
          m,
          ano,
        );
        const npsIntGraf = await this.commonRepo.getNpsIntBodGraf(
          idsede,
          m,
          ano,
        );
        const npsGmGraf = sedeNameGm
          ? await this.commonRepo.getNpsByBodGmGraf(sedeNameGm, m, ano)
          : null;
        monthBlocks.push({ m, mesNom, ventasGraf, npsIntGraf, npsGmGraf });
      }

      for (const {
        m,
        mesNom,
        ventasGraf,
        npsIntGraf,
        npsGmGraf,
      } of monthBlocks) {
        if (ventasGraf) {
          if (m === mes) {
            totalVentaManoObraCurrent = ventasGraf.MO;
            totalVentaRepuestoCurrent = ventasGraf.rptos;
            totalVentaTotCurrent = ventasGraf.TOT;
            totalVentaCurrent =
              ventasGraf.rptos + ventasGraf.MO + ventasGraf.TOT;
            totalHorasCurrent = ventasGraf.horas_facturadas;
          }
          dataPoints1.push({ label: ventasGraf.mes_nom, y: ventasGraf.MO });
          dataPoints2.push({ label: ventasGraf.mes_nom, y: ventasGraf.rptos });
          dataPoints3.push({ label: ventasGraf.mes_nom, y: ventasGraf.TOT });
          dataPoints4.push({
            label: ventasGraf.mes_nom,
            y: ventasGraf.rptos + ventasGraf.MO + ventasGraf.TOT,
          });
          dataPoints5.push({
            label: ventasGraf.mes_nom,
            y: ventasGraf.horas_facturadas,
          });
        }

        if (npsIntGraf) {
          const toEnc =
            (npsIntGraf.enc0a6 ?? 0) +
            (npsIntGraf.enc7a8 ?? 0) +
            (npsIntGraf.enc9a10 ?? 0);
          const npsVal =
            toEnc > 0
              ? (((npsIntGraf.enc9a10 ?? 0) - (npsIntGraf.enc0a6 ?? 0)) /
                  toEnc) *
                100
              : 0;
          dataPoints6.push({
            label: npsIntGraf.mes_nom,
            y: Math.round(npsVal * 100) / 100,
          });
          if (m === mes) objectiveNpsIntCurrent = npsVal;
        } else {
          dataPoints6.push({ label: mesNom, y: 0 });
        }
        objetiveNps.push({ label: mesNom, y: 80 });

        if (sedeNameGm) {
          if (npsGmGraf) {
            const toEncGm =
              (npsGmGraf.enc0a6 ?? 0) +
              (npsGmGraf.enc7a8 ?? 0) +
              (npsGmGraf.enc9a10 ?? 0);
            const npsGmVal =
              toEncGm > 0
                ? (((npsGmGraf.enc9a10 ?? 0) - (npsGmGraf.enc0a6 ?? 0)) /
                    toEncGm) *
                  100
                : 0;
            dataPoints7.push({
              label: npsGmGraf.mes_nom,
              y: npsGmVal,
            });
            if (m === mes) objectiveNpsGMIntCurrent = npsGmVal;
          } else {
            dataPoints7.push({ label: mesNom, y: 0 });
          }
          objetiveNpsGM.push({ label: mesNom, y: 81 });
        }
      }

      sedes.push({
        sede: nombreSede,
        totalVenta: totalVentaCurrent,
        totalVentaManoObra: totalVentaManoObraCurrent,
        totalVentaRepuesto: totalVentaRepuestoCurrent,
        totalVentaTot: totalVentaTotCurrent,
        totalHoras: totalHorasCurrent,
        objectiveNpsIntCurrent: Math.round(objectiveNpsIntCurrent * 100) / 100,
        objectiveNpsGMIntCurrent:
          Math.round(objectiveNpsGMIntCurrent * 100) / 100,
        dataPoints1,
        dataPoints2,
        dataPoints3,
        dataPoints4,
        dataPoints5,
        dataPoints6,
        dataPoints7,
        objetiveNps,
        objetiveNpsGM,
      });
    }

    return {
      variant: 'jefe_taller',
      fecha_actual: fechaActual,
      dia_festivo: diaFestivo,
      id_usu: idUsu,
      nps_int: Math.round(npsInt * 100) / 100,
      total_ventas: totalV,
      nps_col: Math.round(nps * 100) / 100,
      horas_fac: totalHoras,
      mo: toMo,
      rep: toRep,
      tot: toTot,
      bod: sedesUsu,
      //data_bodegas: dataBodegas,
      sedes: sedes.length > 0 ? sedes : undefined,
    };
  }
}
