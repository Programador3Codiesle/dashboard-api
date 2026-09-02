import { Injectable } from '@nestjs/common';
import { IAuditoriaRepository } from '../../domain/auditoria.repository';

@Injectable()
export class ListarTecnicosUseCase {
  constructor(private readonly repo: IAuditoriaRepository) {}

  execute() {
    return this.repo.listarTecnicos();
  }
}
