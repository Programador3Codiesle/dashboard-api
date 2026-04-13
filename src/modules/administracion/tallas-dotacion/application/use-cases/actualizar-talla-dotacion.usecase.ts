import { Injectable } from '@nestjs/common';
import { ITallaDotacionRepository } from '../../domain/talla-dotacion.repository';
import { UpdateTallaDotacionDto } from '../dto/update-talla-dotacion.dto';

@Injectable()
export class ActualizarTallaDotacionUseCase {
  constructor(private readonly repo: ITallaDotacionRepository) {}

  async execute(usuarioId: number, dto: UpdateTallaDotacionDto) {
    return this.repo.actualizarTallas(usuarioId, {
      genero: dto.genero,
      talla_camisa: dto.talla_camisa,
      talla_pantalon: dto.talla_pantalon,
      talla_botas: dto.talla_botas,
      id_empresa: dto.id_empresa,
      ultima_actualizacion: new Date(),
    });
  }
}
