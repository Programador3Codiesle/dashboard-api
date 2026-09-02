import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  CENTROS_REP_TALLER,
  CENTROS_TOTAL,
  IIndicadoresRepository,
  PERFILES_CONSOLIDADOS,
  PresupuestoPosventaDto,
  PresupuestoSedeDto,
  SEDE_BARRANCA,
  SEDE_BOCONO,
  SEDE_META_CODIESEL,
  SEDE_PRINCIPAL,
  SEDE_ROSITA,
} from '../../domain/indicadores.repository';
import { CODIESEL_EMPRESA_ID } from '../../shared/utils/assert-codiesel.util';
import { clampRestante, safeDiv } from '../utils/presupuesto-math';

@Injectable()
export class ObtenerPresupuestoPosventaUseCase {
  constructor(private readonly repo: IIndicadoresRepository) {}

  async execute(
    perfil: number,
    empresaId: number,
  ): Promise<PresupuestoPosventaDto> {
    this.assertCodiesel(empresaId);

    const consolidado = (PERFILES_CONSOLIDADOS as readonly number[]).includes(
      perfil,
    );
    if (consolidado) {
      return this.obtenerConsolidado();
    }
    return this.obtenerSedes(perfil);
  }

  private async obtenerConsolidado() {
    const [fechaIni, fechaFin, diasMes, diaHoy] = await Promise.all([
      this.repo.getPrimerDiaMes(),
      this.repo.getUltimoDiaMes(),
      this.repo.getDiasDelMes(),
      this.repo.getDiaActual(),
    ]);

    const [metaMes, totalVendido, totalRep, totalTot, totalMo, repMostrador] =
      await Promise.all([
        this.repo.getMetaMesNew(SEDE_META_CODIESEL, fechaIni, fechaFin),
        this.repo.getVendidoDiaCentros([...CENTROS_TOTAL]),
        this.repo.getRepuestosTaller([...CENTROS_REP_TALLER]),
        this.repo.getTot([...CENTROS_TOTAL]),
        this.repo.getManoObra([...CENTROS_TOTAL]),
        this.repo.getRepuestosMostradorTotal(),
      ]);

    const metaHoy = diasMes > 0 ? (metaMes / diasMes) * diaHoy : 0;
    const porcentajeHoy = safeDiv(totalVendido, metaHoy);
    const porcentajeHoyRestante = clampRestante(100 - porcentajeHoy);
    const porcentajeMes = safeDiv(totalVendido, metaMes);
    const porcentajeMesRestante = clampRestante(100 - porcentajeMes);

    return {
      modo: 'consolidado' as const,
      totalVendido,
      metaMes,
      metaHoy,
      porcentajeHoy,
      porcentajeHoyRestante,
      porcentajeMes,
      porcentajeMesRestante,
      // Paridad legacy: etiquetas cruzadas
      manoObra: totalTot,
      tot: totalMo - totalTot,
      repuestosTaller: totalRep,
      repuestosMostrador: repMostrador,
    };
  }

  private async obtenerSedes(perfil: number) {
    const [fechaIni, fechaFin, diasMes, diaHoy] = await Promise.all([
      this.repo.getPrimerDiaMes(),
      this.repo.getUltimoDiaMes(),
      this.repo.getDiasDelMes(),
      this.repo.getDiaActual(),
    ]);

    const [
      metaPrincipal,
      metaBocono,
      metaRosita,
      metaBarranca,
      vendidoPrincipal,
      vendidoBocono,
      vendidoRosita,
      vendidoBarranca,
    ] = await Promise.all([
      this.repo.getMetaMes(SEDE_PRINCIPAL, fechaIni, fechaFin),
      this.repo.getMetaMes(SEDE_BOCONO, fechaIni, fechaFin),
      this.repo.getMetaMes(SEDE_ROSITA, fechaIni, fechaFin),
      this.repo.getMetaMes(SEDE_BARRANCA, fechaIni, fechaFin),
      this.repo.getVendidoDiaPrincipal(),
      this.repo.getVendidoDiaBocono(),
      this.repo.getVendidoDiaRosita(),
      this.repo.getVendidoDiaBarranca(),
    ]);

    const [
      repTe,
      repTl,
      repTp,
      repWe,
      repWl,
      repWt,
      repEb,
      repTk,
      repTr,
      totTe,
      totTl,
      totTp,
      totWe,
      totWl,
      totWt,
      totEb,
      totTk,
      totTr,
      moTe,
      moTl,
      moTp,
      moWe,
      moWl,
      moWt,
      moEb,
      moTk,
      moTr,
    ] = await Promise.all([
      this.repo.getRepuestosPorTipos('TE', 'DTE'),
      this.repo.getRepuestosPorTipos('TL', 'DTL'),
      this.repo.getRepuestosPorTipos('TP', 'DTP'),
      this.repo.getRepuestosPorTipos('WE', 'DWE'),
      this.repo.getRepuestosPorTipos('WL', 'DWL'),
      this.repo.getRepuestosPorTipos('WT', 'DWT'),
      this.repo.getRepuestosPorTipos('EB', 'DBE'),
      this.repo.getRepuestosPorTipos('TK', 'DTK'),
      this.repo.getRepuestosPorTipos('TR', 'DTR'),
      this.repo.getTotPorTipos('TE', 'DTE'),
      this.repo.getTotPorTipos('TL', 'DTL'),
      this.repo.getTotPorTipos('TP', 'DTP'),
      this.repo.getTotPorTipos('WE', 'DWE'),
      this.repo.getTotPorTipos('WL', 'DWL'),
      this.repo.getTotPorTipos('WT', 'DWT'),
      this.repo.getTotPorTipos('EB', 'DBE'),
      this.repo.getTotPorTipos('TK', 'DTK'),
      this.repo.getTotPorTipos('TR', 'DTR'),
      this.repo.getManoObraPorTipos('TE', 'DTE'),
      this.repo.getManoObraPorTipos('TL', 'DTL'),
      this.repo.getManoObraPorTipos('TP', 'DTP'),
      this.repo.getManoObraPorTipos('WE', 'DWE'),
      this.repo.getManoObraPorTipos('WL', 'DWL'),
      this.repo.getManoObraPorTipos('WT', 'DWT'),
      this.repo.getManoObraPorTipos('EB', 'DBE'),
      this.repo.getManoObraPorTipos('TK', 'DTK'),
      this.repo.getManoObraPorTipos('TR', 'DTR'),
    ]);

    const buildSede = (
      sede: string,
      totalDia: number,
      metaMes: number,
      tot: number,
      manoObra: number,
      repuestos: number,
    ): PresupuestoSedeDto => {
      const metaHoy = diasMes > 0 ? (metaMes / diasMes) * diaHoy : 0;
      // Legacy: porcentaje_objetivo = totalDia / metaMes (no / metaHoy)
      const porcentajeMes = safeDiv(totalDia, metaMes);
      let porcentajeMesRestante = 100 - porcentajeMes;
      if (porcentajeMes > 100) porcentajeMesRestante = 0;
      const porcentajeObjetivo = safeDiv(totalDia, metaMes);
      const porcentajeObjetivoRestante = 100 - porcentajeObjetivo;
      return {
        sede,
        totalDia,
        metaMes,
        porcentajeMes,
        porcentajeMesRestante,
        metaHoy,
        porcentajeObjetivo,
        porcentajeObjetivoRestante,
        tot,
        manoObra,
        repuestos,
      };
    };

    const principal = buildSede(
      SEDE_PRINCIPAL,
      vendidoPrincipal,
      metaPrincipal,
      totTe + totTl + totTp,
      moTe + moTl + moTp,
      repTe + repTl + repTp,
    );
    const bocono = buildSede(
      SEDE_BOCONO,
      vendidoBocono,
      metaBocono,
      totWe + totWl + totWt,
      moWe + moWl + moWt,
      repWe + repWl + repWt,
    );
    const rosita = buildSede(
      SEDE_ROSITA,
      vendidoRosita,
      metaRosita,
      totTr,
      moTr,
      repTr,
    );
    const barranca = buildSede(
      SEDE_BARRANCA,
      vendidoBarranca,
      metaBarranca,
      totEb + totTk,
      moEb + moTk,
      repEb + repTk,
    );

    const sedes: PresupuestoSedeDto[] = [];
    if (perfil === 2) sedes.push(principal);
    else if (perfil === 3) sedes.push(rosita);
    else if (perfil === 4) sedes.push(bocono);
    else if (perfil === 5) sedes.push(barranca);

    return { modo: 'sedes' as const, sedes };
  }

  private assertCodiesel(empresaId: number) {
    if (empresaId !== CODIESEL_EMPRESA_ID) {
      throw new ForbiddenException(
        'Este módulo solo está disponible para Codiesel',
      );
    }
  }
}
