import { BadRequestException, Injectable } from '@nestjs/common';
import { IRetencion720Repository } from '../../domain/retencion-72-0.repository';
import {
  Retencion720FiltroRowEntity,
  Retencion720RowEntity,
} from '../../domain/retencion-72-0.entity';

export type ModoComparacion = 'autos' | 'byc';

export type ResumenConComparacionResult = {
  principal: Retencion720FiltroRowEntity[];
  comparacion: Retencion720FiltroRowEntity[] | Retencion720RowEntity[];
  etiquetaComparacion: string;
};

@Injectable()
export class ConsultasRetencion720UseCase {
  constructor(private readonly repo: IRetencion720Repository) {}

  listarSegmentosAutos(): Promise<string[]> {
    return this.repo.listarSegmentosAutos();
  }

  listarSegmentosByC(): Promise<string[]> {
    return this.repo.listarSegmentosByC();
  }

  async obtenerFiltroAutos(
    filtro: string,
  ): Promise<Retencion720FiltroRowEntity[]> {
    await this.assertFiltroAutosValido(filtro);
    return this.repo.obtenerResumenFiltroAutos(filtro);
  }

  async obtenerFiltroByC(
    filtro: string,
  ): Promise<Retencion720FiltroRowEntity[]> {
    await this.assertFiltroByCValido(filtro);
    return this.repo.obtenerResumenFiltroByC(filtro);
  }

  listarFamiliasPorSegmento(segmento: string): Promise<string[]> {
    return this.repo.listarFamiliasPorSegmento(segmento);
  }

  async obtenerPorFamilias(
    segmento: string,
    familias: string[],
  ): Promise<Retencion720FiltroRowEntity[]> {
    const permitidas = new Set(
      await this.repo.listarFamiliasPorSegmento(segmento),
    );
    const safe = [...new Set(familias)].filter((f) => permitidas.has(f));
    if (safe.length === 0) {
      throw new BadRequestException(
        'Ninguna familia válida para el segmento indicado.',
      );
    }
    return this.repo.obtenerResumenPorFamilias(safe);
  }

  async obtenerResumenConComparacion(
    modo: ModoComparacion,
    filtro: string,
  ): Promise<ResumenConComparacionResult> {
    if (modo === 'autos') {
      await this.assertFiltroAutosValido(filtro);
      const principal = await this.repo.obtenerResumenFiltroAutos(filtro);
      if (filtro === 'Autos') {
        const comparacion = await this.repo.obtenerResumen();
        return {
          principal,
          comparacion,
          etiquetaComparacion: 'General',
        };
      }
      const comparacion = await this.repo.obtenerResumenFiltroAutos('Autos');
      return {
        principal,
        comparacion,
        etiquetaComparacion: 'Autos',
      };
    }
    await this.assertFiltroByCValido(filtro);
    const principal = await this.repo.obtenerResumenFiltroByC(filtro);
    if (filtro === 'B&C') {
      const comparacion = await this.repo.obtenerResumen();
      return {
        principal,
        comparacion,
        etiquetaComparacion: 'General',
      };
    }
    const comparacion = await this.repo.obtenerResumenFiltroByC('B&C');
    return {
      principal,
      comparacion,
      etiquetaComparacion: 'B&C',
    };
  }

  private async assertFiltroAutosValido(filtro: string): Promise<void> {
    if (filtro === 'Autos' || filtro === 'B&C') {
      return;
    }
    const segs = await this.repo.listarSegmentosAutos();
    if (!segs.includes(filtro)) {
      throw new BadRequestException('Filtro Autos no válido.');
    }
  }

  private async assertFiltroByCValido(filtro: string): Promise<void> {
    if (filtro === 'B&C') {
      return;
    }
    const segs = await this.repo.listarSegmentosByC();
    if (!segs.includes(filtro)) {
      throw new BadRequestException('Filtro B&C no válido.');
    }
  }

  async assertSegmentoVsValido(filtro: string): Promise<void> {
    const [a, b] = await Promise.all([
      this.repo.listarSegmentosAutos(),
      this.repo.listarSegmentosByC(),
    ]);
    const ok =
      filtro === 'Autos' ||
      filtro === 'B&C' ||
      a.includes(filtro) ||
      b.includes(filtro);
    if (!ok) {
      throw new BadRequestException('Filtro Vs no válido.');
    }
  }
}
