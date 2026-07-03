import { BadRequestException, Injectable } from '@nestjs/common';
import { IEstadoTallerRepository } from '../../domain/estado-taller.repository';
import { enrichOrdenRow } from '../estado-taller.presenter';
import type { EstadoTallerPanelEntity } from '../../domain/estado-taller.entity';

function resolveBodegaIds(
  sedes: { idsede: number }[],
  bodega?: string,
): number[] {
  const all = sedes.map((s) => s.idsede);
  if (!bodega || bodega === 'todas') return all;
  const id = Number(bodega);
  if (!Number.isFinite(id) || !all.includes(id)) {
    throw new BadRequestException('Bodega no permitida para el usuario');
  }
  return [id];
}

@Injectable()
export class ObtenerPanelEstadoTallerUseCase {
  constructor(private readonly repo: IEstadoTallerRepository) {}

  async execute(
    nitUsuario: number,
    bodega?: string,
    idEmpresa?: number,
  ): Promise<EstadoTallerPanelEntity> {
    const sedes = await this.repo.getSedesUsuario(nitUsuario, idEmpresa);
    const bodegaIds = resolveBodegaIds(sedes, bodega);
    const [rawOrdenes, totalAbiertas] = await Promise.all([
      this.repo.getOrdenesAbiertas(bodegaIds),
      this.repo.getTotalOrdenesAbiertas(bodegaIds),
    ]);

    const numeros = rawOrdenes.map((row) => row.numero);
    const cotizacionesMap = await this.repo.getCotizacionesSacyrBatch(numeros);

    const ordenes = rawOrdenes.map((row) => {
      const cotizacionesSacyr = cotizacionesMap.get(row.numero) ?? [];
      return enrichOrdenRow(row, row.diffDiasPromesa, cotizacionesSacyr);
    });

    return { sedes, ordenes, totalAbiertas };
  }
}

@Injectable()
export class ObtenerTotalAbiertasUseCase {
  constructor(private readonly repo: IEstadoTallerRepository) {}

  async execute(
    nitUsuario: number,
    bodega?: string,
    idEmpresa?: number,
  ): Promise<number> {
    const sedes = await this.repo.getSedesUsuario(nitUsuario, idEmpresa);
    const bodegaIds = resolveBodegaIds(sedes, bodega);
    return this.repo.getTotalOrdenesAbiertas(bodegaIds);
  }
}

@Injectable()
export class ObtenerEstadosCatalogoUseCase {
  constructor(private readonly repo: IEstadoTallerRepository) {}

  execute() {
    return this.repo.getEstadosCatalogo();
  }
}

@Injectable()
export class ObtenerHistorialOtUseCase {
  constructor(private readonly repo: IEstadoTallerRepository) {}

  execute(numeroOrden: number) {
    return this.repo.getHistorialOt(numeroOrden);
  }
}

@Injectable()
export class ObtenerCotizacionesSacyrUseCase {
  constructor(private readonly repo: IEstadoTallerRepository) {}

  execute(numeroOrden: number) {
    return this.repo.getCotizacionesSacyr(numeroOrden);
  }
}
