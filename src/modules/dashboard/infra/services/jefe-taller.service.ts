import { Injectable } from '@nestjs/common';
import { IDashboardRepository } from '../../domain/dashboard.repository';
import { mapSedesToSedeName } from '../../domain/dashboard.helpers';
import { DashboardJefeTallerDto } from '../../application/dto/dashboard-response.dto';

@Injectable()
export class JefeTallerService {
  constructor(private readonly repo: IDashboardRepository) {}

  async buildJefeTaller(
     nitUsuario: number,
     fechaActual: string,
     diaFestivo: number,
     idUsu: string,
 ): Promise < DashboardJefeTallerDto > {
     const date = await this.repo.getMesAnoActual();
     const mes = date?.mes ?? new Date().getMonth() + 1;
     const ano = date?.ano ?? new Date().getFullYear();

     const sedesRows = await this.repo.getSedesUser(nitUsuario);
     const sedesIds = sedesRows.map((r) => r.idsede).join(', ');
     const sedesUsu = sedesIds.trim() ? sedesIds.replace(/,\s*$/, '') : '';

     let toRep = 0,
     toMo = 0,
     toTot = 0,
     totalV = 0,
     totalHoras = 0;
     const ventasBod = await this.repo.getVentasBod(sedesUsu, mes, ano);
     if(ventasBod) {
         toMo = ventasBod.MO;
         toRep = ventasBod.rptos;
         toTot = ventasBod.TOT;
         totalV = ventasBod.rptos + ventasBod.MO + ventasBod.TOT;
         totalHoras = ventasBod.horas_facturadas;
     }

    let npsInt = 0;
     const npsRows = await this.repo.getDataNpsInternoSedesMes(sedesUsu);
     for(const key of npsRows) {
         const toEnc = (key.enc9a10 ?? 0) + (key.enc0a6 ?? 0) + (key.enc7a8 ?? 0);
         if (toEnc > 0) {
             npsInt = (((key.enc9a10 ?? 0) - (key.enc0a6 ?? 0)) / toEnc) * 100;
         }
     }

    const sedeName = mapSedesToSedeName(sedesUsu);
     let nps = 0;
     if(sedeName) {
         const npsSedeRows = await this.repo.getCalificacionSede(sedeName);
         for (const key of npsSedeRows) {
             const totalEncu = (key.Enc_0_a_6 ?? 0) + (key.Enc_7_a_8 ?? 0) + (key.Enc_9_a_10 ?? 0);
             if (totalEncu > 0) {
                 nps = (((key.Enc_9_a_10 ?? 0) - (key.Enc_0_a_6 ?? 0)) / totalEncu) * 100;
             }
         }
     }

    const dataBodegas = await this.repo.getVentasBodDetalle(sedesUsu, mes, ano);

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
         data_bodegas: dataBodegas,
     };
  }
}