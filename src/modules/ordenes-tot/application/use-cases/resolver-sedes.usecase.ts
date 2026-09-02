import { Injectable } from '@nestjs/common';
import { IOrdenesTotRepository } from '../../domain/ordenes-tot.repository';

@Injectable()
export class ResolverSedesUseCase {
  constructor(private readonly repo: IOrdenesTotRepository) {}

  /** Sedes del usuario: primero por id_usuario; si vacío, fallback por nit. */
  async execute(idUsuario: number, nit?: number): Promise<number[]> {
    const byId = await this.repo.getSedesByIdUsuario(idUsuario);
    if (byId.length > 0) return byId;
    if (nit != null && nit > 0) {
      return this.repo.getSedesByNit(nit);
    }
    return [];
  }
}
