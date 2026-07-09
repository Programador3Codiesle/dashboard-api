import { Injectable } from '@nestjs/common';
import { ListarPosiblesRetornosDto } from '../dto/listar-posibles-retornos.dto';
import { IPosiblesRetornosRepository } from '../../domain/repositories/posibles-retornos.repository.interface';

@Injectable()
export class ListarPosiblesRetornosUseCase {
  constructor(private readonly repository: IPosiblesRetornosRepository) {}

  async execute(dto: ListarPosiblesRetornosDto) {
    const pageSize = dto.pageSize === -1 ? -1 : dto.pageSize;
    const start = pageSize === -1 ? 0 : (dto.page - 1) * pageSize;

    const result = await this.repository.listar({
      numero: dto.numero,
      placa: dto.placa?.trim() || undefined,
      bodega: dto.bodega,
      start,
      length: pageSize,
    });

    const filas = result.filas.map((f) => ({
      ...f,
      acciones: {
        puedeVer: true,
        puedeSolucion: f.estado !== 'POR DEFINIR',
        puedeCerrar: f.origen === 'BDC',
      },
    }));

    return { total: result.total, filas };
  }
}
