import { Injectable } from '@nestjs/common';
import { IEncuestasRepository } from '../../domain/encuestas.repository';

@Injectable()
export class ListarSatisfaccionUseCase {
  constructor(private readonly repo: IEncuestasRepository) {}

  execute(q: string | undefined, page: number, pageSize: number) {
    const safePage = Number.isInteger(page) && page > 0 ? page : 1;
    const safeLimit =
      Number.isInteger(pageSize) && pageSize > 0 ? Math.min(pageSize, 100) : 15;
    const offset = (safePage - 1) * safeLimit;
    return this.repo.listarSatisfaccion(q?.trim() ?? '', offset, safeLimit);
  }
}
