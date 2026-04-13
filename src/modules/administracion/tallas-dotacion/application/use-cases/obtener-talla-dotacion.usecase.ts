import { Injectable } from '@nestjs/common';
import { ITallaDotacionRepository } from '../../domain/talla-dotacion.repository';

@Injectable()
export class ObtenerTallaDotacionUseCase {
  constructor(private readonly repo: ITallaDotacionRepository) {}

  async execute(usuarioId: number, idEmpresa?: number) {
    return this.repo.obtenerTallas(usuarioId, idEmpresa);
  }
}
