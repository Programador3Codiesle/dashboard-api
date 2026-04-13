import { Injectable } from '@nestjs/common';
import { IHorasExtrasRepository } from '../../domain/horas-extras.repository';

@Injectable()
export class ObtenerHorasExtrasDiaActualUseCase {
  constructor(private readonly repo: IHorasExtrasRepository) {}

  async execute() {
    return this.repo.obtenerDiaActual();
  }
}
