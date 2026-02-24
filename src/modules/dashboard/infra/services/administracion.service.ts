import { Injectable } from '@nestjs/common';
import { IDashboardCommonRepository } from '../../domain/dashboard-common.repository';
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
  constructor(
    private readonly commonRepo: IDashboardCommonRepository
  ) { }

  async buildAdmin(
    nitUsuario: number,
    fechaActual: string,
    diaFestivo: number,
    idUsu: string,
    perfilNum: number,
  ): Promise<DashboardAdminDto> {
    const base: DashboardAdminDto = {
      variant: 'admin',
      fecha_actual: fechaActual,
      dia_festivo: diaFestivo,
      id_usu: idUsu,
    };

    const grafSedes = await this.commonRepo.getGrafSedes();
    base.graf_sedes = grafSedes.length > 0 ? grafSedes : undefined;

    const presuGiron = await this.commonRepo.getPresupuestoMesSedesNew('1,11,9,21');
    const presuBocono = await this.commonRepo.getPresupuestoMesSedesNew('8,14,16,22');
    const presuRosita = await this.commonRepo.getPresupuestoMesSedesNew('7');
    const presuBarranca = await this.commonRepo.getPresupuestoMesSedesNew('6,19');
    const presuSoloc = await this.commonRepo.getPresupuestoMesSedesNew('23');
    const presuChev = await this.commonRepo.getPresupuestoMesSedesNew('4');

    const prin = await this.commonRepo.getPresupuestoDia(CENTROS_GIRON);
    const boc = await this.commonRepo.getPresupuestoDia(CENTROS_BOCONO);
    const ros = await this.commonRepo.getPresupuestoDia(CENTROS_ROSITA);
    const barran = await this.commonRepo.getPresupuestoDia(CENTROS_BARRANCA);
    const solochevr = await this.commonRepo.getPresupuestoDia(CENTROS_SOLOCH);
    const chevrp = await this.commonRepo.getPresupuestoDia(CENTROS_CHEVRO);

    const toDiasMes = await this.commonRepo.getTotalDias();
    const toDiasHoy = await this.commonRepo.getDiasActual();
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

    const toPosvRow = await this.commonRepo.getPresupuestoDia(CENTROS_TODOS);
    base.to_posv = toPosvRow?.total ?? undefined;

    const calPacRows = await this.commonRepo.getCalificacionSedeGeneral();
    base.cal_pac =
      calPacRows.length > 0 && calPacRows[0].Calificacion != null
        ? { Calificacion: calPacRows[0].Calificacion }
        : undefined;

    const inventario = await this.commonRepo.getInformeInventario();
    let valToInv = 0;
    for (const row of inventario) {
      valToInv += (row.Promedio ?? 0) * (row.stock ?? 0);
    }
    base.to_inv = valToInv > 0 ? valToInv : undefined;

    const bodNps = '1,9,11,21,7,6,19,8,14,16,22';
    const npsIntRows = await this.commonRepo.getDataNpsInternoSedes(bodNps);
    let enc0a6 = 0,
      enc7a8 = 0,
      enc9a10 = 0;
    for (const row of npsIntRows) {
      enc0a6 += row.enc0a6 ?? 0;
      enc7a8 += row.enc7a8 ?? 0;
      enc9a10 += row.enc9a10 ?? 0;
    }
    const toEnc = enc0a6 + enc7a8 + enc9a10;
    if (toEnc > 0) {
      base.nps_int = Math.round(((enc9a10 - enc0a6) / toEnc) * 10000) / 100;
    }

    // Construir resumen homogéneo por sede (presupuesto vs total), para una UI moderna basada en cards.
    const sedesPresu: DashboardAdminDto['sedes_presupuesto'] = [];
    const findTotal = (key: string): number =>
      grafSedes.find((s) => s.sede === key)?.total ?? 0;

    const pushSede = (
      key: string,
      label: string,
      presupuestoRow: { presupuesto: number } | null | undefined,
      porcentaje?: number,
    ) => {
      if (!presupuestoRow && !porcentaje) return;
      const presupuesto = presupuestoRow?.presupuesto ?? 0;
      const total = findTotal(key);
      const pctValue =
        porcentaje != null
          ? porcentaje
          : presupuesto > 0
          ? Math.round((total / presupuesto) * 10000) / 100
          : 0;
      sedesPresu.push({
        key,
        sede: label,
        presupuesto,
        total,
        porcentaje: pctValue,
        metaCumplida: pctValue >= 100,
      });
    };

    pushSede('giron', 'Girón', presuGiron, base.porcen_giron);
    pushSede('rosita', 'La Rosita', presuRosita, base.porcen_rosita);
    pushSede('barranca', 'Barrancabermeja', presuBarranca, base.porcen_barranca);
    pushSede('bocono', 'Cúcuta Boconó', presuBocono, base.porcen_bocono);
    pushSede('solochevrolet', 'Solochevrolet', presuSoloc, base.porcen_soloc);
    pushSede('chevropartes', 'Chevropartes', presuChev, base.porcen_chev);

    base.sedes_presupuesto = sedesPresu.length > 0 ? sedesPresu : undefined;

    const dataEstado: Array<{ estado: string }> = [];
    base.data_estado = dataEstado.length > 0 ? dataEstado : undefined;

    // Detalle por sede/taller (vista jerárquica similar al legacy, pero en estructura moderna).
    const sedesTalleres: NonNullable<DashboardAdminDto['sedes_talleres']> = [];

    const buildTaller = async (
      centros: string,
      nombre: string,
    ) => {
      const [presupuestoRow, totalRow, moRow, totRow, repRow] =
        await Promise.all([
          this.commonRepo.getPresupuestoMesSedesNew(centros),
          this.commonRepo.getTotalPresupuestoByCentros(centros),
          this.commonRepo.getPresupuestoMo(centros),
          this.commonRepo.getPresupuestoTot(centros),
          this.commonRepo.getPresupuestoRep(centros),
        ]);
      const presupuesto = presupuestoRow?.presupuesto ?? 0;
      const total = totalRow?.total ?? 0;
      const porcentaje =
        presupuesto > 0 ? Math.round((total / presupuesto) * 10000) / 100 : 0;
      return {
        nombre,
        total,
        porcentaje,
        metaCumplida: porcentaje >= 100,
        mo: moRow?.total ?? undefined,
        tot: totRow?.total ?? undefined,
        rep: repRow?.total ?? undefined,
      };
    };

    // Girón: Diesel / Gasolina / Colisión / Mostrador.
    const talleresGiron = [
      await buildTaller('40', 'Taller Diesel Girón'),
      await buildTaller('4', 'Taller Gasolina Girón'),
      await buildTaller('33,45', 'Taller Colisión Girón'),
      await buildTaller('3', 'Mostrador Girón'),
    ];
    sedesTalleres.push({
      key: 'giron',
      sede: 'Girón',
      talleres: talleresGiron,
    });

    // La Rosita: Taller gasolina / Mostrador.
    const talleresRosita = [
      await buildTaller('16', 'Taller Gasolina La Rosita'),
      await buildTaller('17', 'Mostrador La Rosita'),
    ];
    sedesTalleres.push({
      key: 'rosita',
      sede: 'La Rosita',
      talleres: talleresRosita,
    });

    // Barrancabermeja: Diesel / Gasolina / Mostrador.
    const talleresBarranca = [
      await buildTaller('70', 'Taller Diesel Barrancabermeja'),
      await buildTaller('13', 'Taller Gasolina Barrancabermeja'),
      await buildTaller('11', 'Mostrador Barrancabermeja'),
    ];
    sedesTalleres.push({
      key: 'barranca',
      sede: 'Barrancabermeja',
      talleres: talleresBarranca,
    });

    // Cúcuta Boconó: Diesel / Gasolina / Colisión / Mostrador.
    const talleresBocono = [
      await buildTaller('80', 'Taller Diesel Boconó'),
      await buildTaller('29', 'Taller Gasolina Boconó'),
      await buildTaller('31,46', 'Taller Colisión Boconó'),
      await buildTaller('28', 'Mostrador Boconó'),
    ];
    sedesTalleres.push({
      key: 'bocono',
      sede: 'Cúcuta Boconó',
      talleres: talleresBocono,
    });

    // Solochevrolet y Chevropartes: solo mostrador general por ahora.
    const talleresSolochevrolet = [
      await buildTaller('60', 'Solochevrolet'),
    ];
    sedesTalleres.push({
      key: 'solochevrolet',
      sede: 'Solochevrolet',
      talleres: talleresSolochevrolet,
    });

    const talleresChevropartes = [
      await buildTaller('15', 'Chevropartes'),
    ];
    sedesTalleres.push({
      key: 'chevropartes',
      sede: 'Chevropartes',
      talleres: talleresChevropartes,
    });

    base.sedes_talleres = sedesTalleres;

    return base;
  }
}

