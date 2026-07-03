import { BadRequestException, Injectable } from '@nestjs/common';
import {
  SEDE_BODEGAS,
  SEDE_KEYS,
  SEDE_LABELS,
  TODAS_BODEGAS,
  isSedeKey,
  type SedeKey,
} from '../constants/sede-bodegas.constants';
import { IInformeOtAbiertasRepository } from '../../domain/informe-ot-abiertas.repository';
import type {
  InformeGeneralEntity,
  InformePorSedeEntity,
  InformePorTallerEntity,
} from '../../domain/informe-ot-abiertas.entity';

@Injectable()
export class ObtenerInformeGeneralUseCase {
  constructor(private readonly repo: IInformeOtAbiertasRepository) {}

  async execute(): Promise<InformeGeneralEntity> {
    const ordenes = await this.repo.getOrdenesAbiertas(TODAS_BODEGAS);

    const totalesSedes = await Promise.all(
      SEDE_KEYS.map(async (sede) => {
        const rows = await this.repo.getOrdenesAbiertas(SEDE_BODEGAS[sede]);
        return {
          sede,
          label: SEDE_LABELS[sede],
          total: rows.length,
        };
      }),
    );

    return {
      totalesSedes,
      totalGeneral: ordenes.length,
      ordenes,
    };
  }
}

@Injectable()
export class ObtenerInformePorSedeUseCase {
  constructor(private readonly repo: IInformeOtAbiertasRepository) {}

  async execute(sedeParam: string): Promise<InformePorSedeEntity> {
    if (!isSedeKey(sedeParam)) {
      throw new BadRequestException('Sede no válida');
    }
    const sede: SedeKey = sedeParam;
    const bodegaIds = SEDE_BODEGAS[sede];

    const [totalesBodegas, ordenes] = await Promise.all([
      this.repo.getCountPorBodega(bodegaIds),
      this.repo.getOrdenesAbiertas(bodegaIds),
    ]);

    return {
      sede,
      sedeLabel: SEDE_LABELS[sede],
      totalesBodegas,
      ordenes,
    };
  }
}

@Injectable()
export class ObtenerInformePorTallerUseCase {
  constructor(private readonly repo: IInformeOtAbiertasRepository) {}

  async execute(bodegaId: number): Promise<InformePorTallerEntity> {
    if (!Number.isFinite(bodegaId) || bodegaId <= 0) {
      throw new BadRequestException('Bodega no válida');
    }

    const asesores = await this.repo.getCountPorAsesor(bodegaId);

    return {
      bodegaId,
      asesores,
    };
  }
}
