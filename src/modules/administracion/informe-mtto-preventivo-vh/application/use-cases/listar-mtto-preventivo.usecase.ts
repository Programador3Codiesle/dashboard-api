import { Injectable } from '@nestjs/common';
import { IInformeMttoPreventivoRepository } from '../../domain/informe-mtto-preventivo.repository';

@Injectable()
export class ListarMttoPreventivoUseCase {
  constructor(private readonly repo: IInformeMttoPreventivoRepository) {}

  async execute() {
    return this.repo.listar();
  }
}
