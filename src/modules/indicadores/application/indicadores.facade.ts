import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  CENTROS_REP_TALLER,
  CENTROS_TOTAL,
  INDICADORES_REPOSITORY,
  IIndicadoresRepository,
  PERFILES_CONSOLIDADOS,
  PresupuestoPosventaDto,
  PresupuestoSedeDto,
  SEDE_BARRANCA,
  SEDE_BOCONO,
  SEDE_META_CODIESEL,
  SEDE_PRINCIPAL,
  SEDE_ROSITA,
  SedeDetalleDto,
  TallerDetalleDto,
  TipoOperacionDto,
} from '../domain/indicadores.repository';
import {
  SEDES_DETALLE,
  TALLERES_POR_SEDE,
  TIPO_OP_POR_BODEGA,
} from '../domain/presupuesto-drilldown.config';

const CODIESEL_EMPRESA_ID = 1;

function safeDiv(numerador: number, denominador: number): number {
  if (!denominador) return 0;
  return (numerador / denominador) * 100;
}

function clampRestante(restante: number): number {
  return restante < 0 ? 0 : restante;
}

@Injectable()
export class IndicadoresFacade {
  constructor(
    @Inject(INDICADORES_REPOSITORY)
    private readonly repo: IIndicadoresRepository,
  ) {}

  async obtenerPresupuestoPosventa(
    perfil: number,
    empresaId: number,
  ): Promise<PresupuestoPosventaDto> {
    if (empresaId !== CODIESEL_EMPRESA_ID) {
      throw new ForbiddenException(
        'Este módulo solo está disponible para Codiesel',
      );
    }

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

    const [
      metaMes,
      totalVendido,
      totalRep,
      totalTot,
      totalMo,
      repMostrador,
    ] = await Promise.all([
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

  /** Nivel 2 — real_time_sedes (todas las sedes + mostradores) */
  async obtenerSedesDetalle(empresaId: number): Promise<SedeDetalleDto[]> {
    this.assertCodiesel(empresaId);

    const [fechaIni, fechaFin, diasMes, diaHoy] = await Promise.all([
      this.repo.getPrimerDiaMes(),
      this.repo.getUltimoDiaMes(),
      this.repo.getDiasDelMes(),
      this.repo.getDiaActual(),
    ]);

    const results: SedeDetalleDto[] = [];

    for (const cfg of SEDES_DETALLE) {
      const [metaMes, totalDia, tot, moRaw, repTall, repMos] =
        await Promise.all([
          this.repo.getMetaMes(cfg.metaSede, fechaIni, fechaFin),
          this.repo.getVendidoDiaCentros(cfg.centrosTotal),
          cfg.conDetalleTaller
            ? this.repo.getTot(cfg.centrosTotal)
            : Promise.resolve(0),
          cfg.conDetalleTaller
            ? this.repo.getManoObra(cfg.centrosTotal)
            : Promise.resolve(0),
          cfg.conDetalleTaller
            ? this.repo.getRepuestosTaller(cfg.centrosRepTaller)
            : Promise.resolve(0),
          cfg.conDetalleTaller && cfg.centrosMostrador.length > 0
            ? this.repo.getRepuestosMostrador(cfg.centrosMostrador)
            : Promise.resolve(0),
        ]);

      const metaHoy = diasMes > 0 ? (metaMes / diasMes) * diaHoy : 0;
      const porcentajeHoy = safeDiv(totalDia, metaHoy);
      const porcentajeHoyRestante = clampRestante(100 - porcentajeHoy);
      const porcentajeMes = safeDiv(totalDia, metaMes);
      let porcentajeMesRestante = 100 - porcentajeMes;
      if (porcentajeMes > 100) porcentajeMesRestante = 0;

      results.push({
        sede: cfg.sede,
        totalDia,
        metaMes,
        metaHoy,
        porcentajeHoy,
        porcentajeHoyRestante,
        porcentajeMes,
        porcentajeMesRestante,
        tot,
        manoObra: moRaw - tot,
        repuestosTaller: repTall,
        repuestosMostrador: repMos,
        conDetalleTaller: cfg.conDetalleTaller,
      });
    }

    return results;
  }

  /** Nivel 3 — real_time_taller */
  async obtenerTalleresDetalle(
    sede: string,
    empresaId: number,
  ): Promise<{ sede: string; talleres: TallerDetalleDto[] }> {
    this.assertCodiesel(empresaId);

    const talleresCfg = TALLERES_POR_SEDE[sede];
    if (!talleresCfg) {
      throw new BadRequestException(`Sede no válida: ${sede}`);
    }

    const [fechaIni, fechaFin, diasMes, diaHoy] = await Promise.all([
      this.repo.getPrimerDiaMes(),
      this.repo.getUltimoDiaMes(),
      this.repo.getDiasDelMes(),
      this.repo.getDiaActual(),
    ]);

    const talleres: TallerDetalleDto[] = [];

    for (const cfg of talleresCfg) {
      const [metaMes, totalDia] = await Promise.all([
        this.repo.getMetaMes(cfg.metaSede, fechaIni, fechaFin),
        cfg.esMostrador
          ? this.repo.getRepuestosMostrador(cfg.centros)
          : this.repo.getVendidoDiaCentros(cfg.centros),
      ]);

      const metaHoy = diasMes > 0 ? (metaMes / diasMes) * diaHoy : 0;
      const porcentajeHoy = safeDiv(totalDia, metaHoy);
      const porcentajeHoyRestante = clampRestante(100 - porcentajeHoy);
      const porcentajeMes = safeDiv(totalDia, metaMes);
      let porcentajeMesRestante = 100 - porcentajeMes;
      if (porcentajeMes > 100) porcentajeMesRestante = 0;

      talleres.push({
        nombre: cfg.nombre,
        totalDia,
        metaMes,
        metaHoy,
        porcentajeHoy,
        porcentajeHoyRestante,
        porcentajeMes,
        porcentajeMesRestante,
        esMostrador: cfg.esMostrador,
      });
    }

    return { sede, talleres };
  }

  /** Nivel 4 — real_time_tipo_op (REPUESTOS / TOT / MO) */
  async obtenerTipoOperaciones(
    bodega: string,
    empresaId: number,
  ): Promise<{ bodega: string; operaciones: TipoOperacionDto[] }> {
    this.assertCodiesel(empresaId);

    const cfg = TIPO_OP_POR_BODEGA[bodega];
    if (!cfg) {
      throw new BadRequestException(`Bodega/taller no válido: ${bodega}`);
    }

    const [fechaIni, fechaFin, diasMes, diaHoy] = await Promise.all([
      this.repo.getPrimerDiaMes(),
      this.repo.getUltimoDiaMes(),
      this.repo.getDiasDelMes(),
      this.repo.getDiaActual(),
    ]);

    const [metaRep, metaTot, metaMo, diaRep, diaTot, diaMoRaw] =
      await Promise.all([
        this.repo.getMetaMes(cfg.metaRep, fechaIni, fechaFin),
        this.repo.getMetaMes(cfg.metaTot, fechaIni, fechaFin),
        this.repo.getMetaMes(cfg.metaMo, fechaIni, fechaFin),
        this.repo.getRepuestosTaller(cfg.centros),
        this.repo.getTot(cfg.centros),
        this.repo.getManoObra(cfg.centros),
      ]);

    const diaMo = diaMoRaw - diaTot;

    const buildOp = (
      operacion: string,
      totalDia: number,
      metaMes: number,
    ): TipoOperacionDto => {
      const metaHoy = diasMes > 0 ? (metaMes / diasMes) * diaHoy : 0;
      const porcentajeHoy = safeDiv(totalDia, metaHoy);
      const porcentajeHoyRestante = clampRestante(100 - porcentajeHoy);
      const porcentajeMes = safeDiv(totalDia, metaMes);
      let porcentajeMesRestante = 100 - porcentajeMes;
      if (porcentajeMes > 100) porcentajeMesRestante = 0;
      return {
        operacion,
        totalDia,
        metaMes,
        metaHoy,
        porcentajeHoy,
        porcentajeHoyRestante,
        porcentajeMes,
        porcentajeMesRestante,
      };
    };

    return {
      bodega,
      operaciones: [
        buildOp('REPUESTOS', diaRep, metaRep),
        buildOp('TOT', diaTot, metaTot),
        buildOp('MO', diaMo, metaMo),
      ],
    };
  }

  private assertCodiesel(empresaId: number) {
    if (empresaId !== CODIESEL_EMPRESA_ID) {
      throw new ForbiddenException(
        'Este módulo solo está disponible para Codiesel',
      );
    }
  }
}
