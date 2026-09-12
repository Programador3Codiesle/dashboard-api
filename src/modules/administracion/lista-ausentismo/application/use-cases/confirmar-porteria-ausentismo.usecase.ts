import { Injectable, BadRequestException } from '@nestjs/common';
import { IListaAusentismoRepository } from '../../domain/lista-ausentismo.repository';

@Injectable()
export class ConfirmarPorteriaAusentismoUseCase {
  constructor(private readonly repo: IListaAusentismoRepository) {}

  async execute(id: number) {
    const ok = await this.repo.confirmarPorteria(BigInt(id));
    if (!ok) {
      throw new BadRequestException(
        'No se pudo confirmar la portería del ausentismo',
      );
    }
    return { ok: true };
  }
}
