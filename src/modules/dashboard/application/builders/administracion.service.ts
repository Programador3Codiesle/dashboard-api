import { Injectable } from '@nestjs/common';
import { mapInBatches } from '../../../../core/infra/async-batch';
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
import { DashboardAdminDto } from '../dto/dashboard-response.dto';

@Injectable()
export class AdministracionService {
  constructor(private readonly commonRepo: IDashboardCommonRepository) {}

  async buildAdmin(
    nitUsuario: number,
    fechaActual: string,
    diaFestivo: number,
    idUsu: string,
    perfilNum: number,
    idEmpresa?: number,
  ): Promise<DashboardAdminDto> {
    const base: DashboardAdminDto = {
      variant: 'admin',
      fecha_actual: fechaActual,
      dia_festivo: diaFestivo,
      id_usu: idUsu,
    };

    // Contenido legacy (Codiesel): no aplica a otras empresas hasta tener consultas equivalentes.
    if (idEmpresa != null && idEmpresa !== 1) {
      return base;
    }

    const [y, m] = (fechaActual || '').split('-').map(Number);
    const fechaIni = y && m ? `${y}-${String(m).padStart(2, '0')}-01` : '';
    const lastDay = y && m ? new Date(y, m, 0).getDate() : 30;
    const fechaFin =
      y && m
        ? `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
        : '';

    const [grafSedes, presupuestoMesAll] = await Promise.all([
      this.commonRepo.getGrafSedes(),
      fechaIni && fechaFin
        ? this.commonRepo.getPresupuestoMesAll(fechaIni, fechaFin)
        : Promise.resolve([]),
    ]);
    base.graf_sedes = grafSedes.length > 0 ? grafSedes : undefined;

    const norm = (s: string) =>
      (s || '')
        .trim()
        .toUpperCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '');
    const legacySedeToKey: Record<string, string> = {
      [norm('CODIESEL PRINCIPAL')]: 'giron',
      [norm('CODIESEL LA ROSITA')]: 'rosita',
      [norm('CODIESEL BARRANCABERMEJA')]: 'barranca',
      [norm('CODIESEL VILLA DEL ROSARIO')]: 'bocono',
      [norm('SOLOCHEVROLET MOSTRADOR')]: 'solochevrolet',
      [norm('CHEVROPARTES MOSTRADOR')]: 'chevropartes',
    };
    const presupuestoByKey: Record<string, number> = {};
    for (const row of presupuestoMesAll) {
      const n = norm(row.sede);
      const key = legacySedeToKey[n];
      if (key) presupuestoByKey[key] = row.presupuesto;
    }

    // Metas por taller: el legacy no usa nombres sino posiciones del arreglo $pres_codiesel.
    // Replicamos el mismo mapeo de índices -> taller.
    const metaTallerByName: Record<string, number> = {};
    const pres = presupuestoMesAll;
    const setMeta = (nombre: string, index: number) => {
      const row = pres[index];
      if (!row) return;
      metaTallerByName[norm(nombre)] = row.presupuesto;
    };
    // Girón
    setMeta('Taller Diesel Girón', 8);
    setMeta('Taller Gasolina Girón', 10);
    setMeta('Taller Colisión Girón', 9);
    setMeta('Mostrador Girón', 11);
    // Rosita
    setMeta('Taller Gasolina la Rosita', 12);
    setMeta('Mostrador la Rosita', 13);
    // Barrancabermeja (legacy usa B/meja)
    setMeta('Taller Diesel B/meja', 5);
    setMeta('Taller Gasolina B/meja', 6);
    setMeta('Mostrador B/meja', 7);
    // Boconó
    setMeta('Taller Diesel Boconó', 14);
    setMeta('Taller Gasolina Boconó', 15);
    setMeta('Taller Colisión Boconó', 16);
    setMeta('Mostrador Boconó', 17);
    // Solochevrolet / Chevropartes: sólo sede en legacy, usamos misma meta para el único taller.
    setMeta('Solochevrolet', 20);
    setMeta('Chevropartes', 19);

    const aliasTallerLookup: Record<string, string> = {
      [norm('Taller Diesel Barrancabermeja')]: norm('Taller Diesel B/meja'),
      [norm('Taller Gasolina Barrancabermeja')]: norm('Taller Gasolina B/meja'),
      [norm('Mostrador Barrancabermeja')]: norm('Mostrador B/meja'),
      [norm('Taller Gasolina La Rosita')]: norm('Taller Gasolina la Rosita'),
      [norm('Mostrador La Rosita')]: norm('Mostrador la Rosita'),
    };

    const resolvePresu = (
      key: string,
      centros: string,
    ): Promise<{ presupuesto: number } | null> =>
      presupuestoByKey[key] != null
        ? Promise.resolve({ presupuesto: presupuestoByKey[key] })
        : this.commonRepo.getPresupuestoMesSedesNew(centros);

    const bodNps = '1,9,11,21,7,6,19,8,14,16,22';

    const [
      presuGiron,
      presuBocono,
      presuRosita,
      presuBarranca,
      presuSoloc,
      presuChev,
      prin,
      boc,
      ros,
      barran,
      solochevr,
      chevrp,
      toPosvRow,
      calPacRows,
      inventario,
      npsIntRows,
    ] = await Promise.all([
      resolvePresu('giron', '1,11,9,21'),
      resolvePresu('bocono', '8,14,16,22'),
      resolvePresu('rosita', '7'),
      resolvePresu('barranca', '6,19'),
      resolvePresu('solochevrolet', '23'),
      resolvePresu('chevropartes', '4'),
      this.commonRepo.getPresupuestoDia(CENTROS_GIRON),
      this.commonRepo.getPresupuestoDia(CENTROS_BOCONO),
      this.commonRepo.getPresupuestoDia(CENTROS_ROSITA),
      this.commonRepo.getPresupuestoDia(CENTROS_BARRANCA),
      this.commonRepo.getPresupuestoDia(CENTROS_SOLOCH),
      this.commonRepo.getPresupuestoDia(CENTROS_CHEVRO),
      this.commonRepo.getPresupuestoDia(CENTROS_TODOS),
      this.commonRepo.getCalificacionSedeGeneral(),
      this.commonRepo.getInformeInventario(),
      this.commonRepo.getDataNpsInternoSedes(bodNps),
    ]);

    const pct = (total: number, presupuesto: number): number =>
      presupuesto > 0 ? Math.round((total / presupuesto) * 10000) / 100 : 0;

    base.porcen_giron = presuGiron
      ? pct(prin?.total ?? 0, presuGiron.presupuesto)
      : undefined;
    base.porcen_rosita = presuRosita
      ? pct(ros?.total ?? 0, presuRosita.presupuesto)
      : undefined;
    base.porcen_barranca = presuBarranca
      ? pct(barran?.total ?? 0, presuBarranca.presupuesto)
      : undefined;
    base.porcen_bocono = presuBocono
      ? pct(boc?.total ?? 0, presuBocono.presupuesto)
      : undefined;
    base.porcen_soloc = presuSoloc
      ? pct(solochevr?.total ?? 0, presuSoloc.presupuesto)
      : undefined;
    base.porcen_chev = presuChev
      ? pct(chevrp?.total ?? 0, presuChev.presupuesto)
      : undefined;

    base.to_posv = toPosvRow?.total ?? undefined;
    base.cal_pac =
      calPacRows.length > 0 && calPacRows[0].Calificacion != null
        ? { Calificacion: calPacRows[0].Calificacion }
        : undefined;

    let valToInv = 0;
    for (const row of inventario) {
      valToInv += (row.Promedio ?? 0) * (row.stock ?? 0);
    }
    base.to_inv = valToInv > 0 ? valToInv : undefined;

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
    pushSede(
      'barranca',
      'Barrancabermeja',
      presuBarranca,
      base.porcen_barranca,
    );
    pushSede('bocono', 'Cúcuta Boconó', presuBocono, base.porcen_bocono);
    pushSede('solochevrolet', 'Solochevrolet', presuSoloc, base.porcen_soloc);
    pushSede('chevropartes', 'Chevropartes', presuChev, base.porcen_chev);

    base.sedes_presupuesto = sedesPresu.length > 0 ? sedesPresu : undefined;

    const dataEstado: Array<{ estado: string }> = [];
    base.data_estado = dataEstado.length > 0 ? dataEstado : undefined;

    // Detalle por sede/taller (vista jerárquica similar al legacy, pero en estructura moderna).
    const sedesTalleres: NonNullable<DashboardAdminDto['sedes_talleres']> = [];

    const buildTaller = async (centros: string, nombre: string) => {
      const n = norm(nombre);
      const alias = aliasTallerLookup[n] ?? n;
      const metaFromLegacy = metaTallerByName[alias];
      const [presupuestoRow, totalRow, moRow, totRow, repRow] =
        await Promise.all([
          metaFromLegacy != null
            ? Promise.resolve({ presupuesto: metaFromLegacy })
            : this.commonRepo.getPresupuestoMesSedesNew(centros),
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
        presupuesto,
        total,
        porcentaje,
        metaCumplida: porcentaje >= 100,
        mo: moRow?.total ?? undefined,
        tot: totRow?.total ?? undefined,
        rep: repRow?.total ?? undefined,
      };
    };

    const tallerSpecs: Array<{
      key: string;
      sede: string;
      centros: string;
      nombre: string;
    }> = [
      {
        key: 'giron',
        sede: 'Girón',
        centros: '40',
        nombre: 'Taller Diesel Girón',
      },
      {
        key: 'giron',
        sede: 'Girón',
        centros: '4',
        nombre: 'Taller Gasolina Girón',
      },
      {
        key: 'giron',
        sede: 'Girón',
        centros: '33,45',
        nombre: 'Taller Colisión Girón',
      },
      { key: 'giron', sede: 'Girón', centros: '3', nombre: 'Mostrador Girón' },
      {
        key: 'rosita',
        sede: 'La Rosita',
        centros: '16',
        nombre: 'Taller Gasolina La Rosita',
      },
      {
        key: 'rosita',
        sede: 'La Rosita',
        centros: '17',
        nombre: 'Mostrador La Rosita',
      },
      {
        key: 'barranca',
        sede: 'Barrancabermeja',
        centros: '70',
        nombre: 'Taller Diesel Barrancabermeja',
      },
      {
        key: 'barranca',
        sede: 'Barrancabermeja',
        centros: '13',
        nombre: 'Taller Gasolina Barrancabermeja',
      },
      {
        key: 'barranca',
        sede: 'Barrancabermeja',
        centros: '11',
        nombre: 'Mostrador Barrancabermeja',
      },
      {
        key: 'bocono',
        sede: 'Cúcuta Boconó',
        centros: '80',
        nombre: 'Taller Diesel Boconó',
      },
      {
        key: 'bocono',
        sede: 'Cúcuta Boconó',
        centros: '29',
        nombre: 'Taller Gasolina Boconó',
      },
      {
        key: 'bocono',
        sede: 'Cúcuta Boconó',
        centros: '31,46',
        nombre: 'Taller Colisión Boconó',
      },
      {
        key: 'bocono',
        sede: 'Cúcuta Boconó',
        centros: '28',
        nombre: 'Mostrador Boconó',
      },
      {
        key: 'solochevrolet',
        sede: 'Solochevrolet',
        centros: '60',
        nombre: 'Solochevrolet',
      },
      {
        key: 'chevropartes',
        sede: 'Chevropartes',
        centros: '15',
        nombre: 'Chevropartes',
      },
    ];

    const built = await mapInBatches(tallerSpecs, 3, async (spec) => ({
      key: spec.key,
      sede: spec.sede,
      taller: await buildTaller(spec.centros, spec.nombre),
    }));

    const groupOrder = [
      { key: 'giron', sede: 'Girón' },
      { key: 'rosita', sede: 'La Rosita' },
      { key: 'barranca', sede: 'Barrancabermeja' },
      { key: 'bocono', sede: 'Cúcuta Boconó' },
      { key: 'solochevrolet', sede: 'Solochevrolet' },
      { key: 'chevropartes', sede: 'Chevropartes' },
    ];
    for (const g of groupOrder) {
      sedesTalleres.push({
        key: g.key,
        sede: g.sede,
        talleres: built
          .filter((row) => row.key === g.key)
          .map((row) => row.taller),
      });
    }

    base.sedes_talleres = sedesTalleres;

    return base;
  }
}
