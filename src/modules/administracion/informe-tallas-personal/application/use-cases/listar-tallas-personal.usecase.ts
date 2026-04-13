import { Injectable } from '@nestjs/common';
import { ITallaPersonalRepository } from '../../domain/talla-personal.repository';

@Injectable()
export class ListarTallasPersonalUseCase {
  constructor(private readonly repo: ITallaPersonalRepository) {}

  async execute() {
    return this.repo.listar();
  }
}
