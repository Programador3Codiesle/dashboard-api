import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  IIndicadoresRepository,
  TallerDetalleDto,
} from '../../domain/indicadores.repository';
import { TALLERES_POR_SEDE } from '../../domain/presupuesto-drilldown.config';
import { CODIESEL_EMPRESA_ID } from '../../shared/utils/assert-codiesel.util';
import { clampRestante, safeDiv } from '../utils/presupuesto-math';

@Injectable()
export class ObtenerTalleresDetalleUseCase {
  constructor(private readonly repo: IIndicadoresRepository) {}

  async execute(
    sede: string,
    empresaId: number,
  ): Promise<{ sede: string; talleres: TallerDetalleDto[] }> {
    if (empresaId !== CODIESEL_EMPRESA_ID) {
      throw new ForbiddenException(
        'Este módulo solo está disponible para Codiesel',
      );
    }

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

    const talleres = await Promise.all(
      talleresCfg.map(async (cfg): Promise<TallerDetalleDto> => {
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

        return {
          nombre: cfg.nombre,
          totalDia,
          metaMes,
          metaHoy,
          porcentajeHoy,
          porcentajeHoyRestante,
          porcentajeMes,
          porcentajeMesRestante,
          esMostrador: cfg.esMostrador,
        };
      }),
    );

    return { sede, talleres };
  }
}
