import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  IIndicadoresRepository,
  TipoOperacionDto,
} from '../../domain/indicadores.repository';
import { TIPO_OP_POR_BODEGA } from '../../domain/presupuesto-drilldown.config';
import { CODIESEL_EMPRESA_ID } from '../../shared/utils/assert-codiesel.util';
import { clampRestante, safeDiv } from '../utils/presupuesto-math';

@Injectable()
export class ObtenerTipoOperacionesUseCase {
  constructor(private readonly repo: IIndicadoresRepository) {}

  async execute(
    bodega: string,
    empresaId: number,
  ): Promise<{ bodega: string; operaciones: TipoOperacionDto[] }> {
    if (empresaId !== CODIESEL_EMPRESA_ID) {
      throw new ForbiddenException(
        'Este módulo solo está disponible para Codiesel',
      );
    }

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
}
