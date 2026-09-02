import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  IIndicadoresRepository,
  SedeDetalleDto,
} from '../../domain/indicadores.repository';
import { SEDES_DETALLE } from '../../domain/presupuesto-drilldown.config';
import { CODIESEL_EMPRESA_ID } from '../../shared/utils/assert-codiesel.util';
import { clampRestante, safeDiv } from '../utils/presupuesto-math';

@Injectable()
export class ObtenerSedesDetalleUseCase {
  constructor(private readonly repo: IIndicadoresRepository) {}

  async execute(empresaId: number): Promise<SedeDetalleDto[]> {
    if (empresaId !== CODIESEL_EMPRESA_ID) {
      throw new ForbiddenException(
        'Este módulo solo está disponible para Codiesel',
      );
    }

    const [fechaIni, fechaFin, diasMes, diaHoy] = await Promise.all([
      this.repo.getPrimerDiaMes(),
      this.repo.getUltimoDiaMes(),
      this.repo.getDiasDelMes(),
      this.repo.getDiaActual(),
    ]);

    return Promise.all(
      SEDES_DETALLE.map(async (cfg): Promise<SedeDetalleDto> => {
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

        return {
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
        };
      }),
    );
  }
}
