import { BadRequestException, Injectable } from '@nestjs/common';
import { IMantenimientoRepository } from '../../domain/mantenimiento.repository';

@Injectable()
export class ListarEquiposUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  async execute(
    page: number,
    limit: number,
    filter?: string,
    bodega?: string,
    area?: string,
  ) {
    const p = Math.max(1, page || 1);
    const l = Math.min(100, Math.max(1, limit || 10));
    const offset = (p - 1) * l;
    const filters = {
      filter: filter?.trim() || undefined,
      bodega: bodega?.trim() || undefined,
      area: area?.trim() || undefined,
    };
    const [data, total] = await Promise.all([
      this.repo.listarEquipos(filters, l, offset),
      this.repo.countEquipos(filters),
    ]);
    return { data, total, page: p, limit: l };
  }
}

@Injectable()
export class NombresFamiliaUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  execute(codigoF: string) {
    if (!codigoF?.trim()) throw new BadRequestException('codigo requerido');
    return this.repo.getNombresFamilia(codigoF.trim());
  }
}

@Injectable()
export class GetEquipoUseCase {
  constructor(private readonly repo: IMantenimientoRepository) {}

  execute(id: number) {
    return this.repo.getEquipoById(id);
  }
}
