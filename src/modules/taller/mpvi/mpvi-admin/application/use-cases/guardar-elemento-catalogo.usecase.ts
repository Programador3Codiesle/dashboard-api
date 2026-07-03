import { Injectable } from '@nestjs/common';
import { IMpviCatalogoRepository } from '../../domain/mpvi-catalogo.repository';

@Injectable()
export class GuardarElementoCatalogoUseCase {
  constructor(private readonly repo: IMpviCatalogoRepository) {}

  execute(op: number, data: Record<string, unknown>) {
    return this.repo.saveData(op, data);
  }
}
