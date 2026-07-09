import { Injectable, NotFoundException } from '@nestjs/common';
import { DetallePlacaDto } from '../dto/detalle-placa.dto';
import { IPosiblesRetornosRepository } from '../../domain/repositories/posibles-retornos.repository.interface';

@Injectable()
export class ObtenerDetallePlacaUseCase {
  constructor(private readonly repository: IPosiblesRetornosRepository) {}

  async execute(dto: DetallePlacaDto) {
    try {
      return await this.repository.obtenerDetallePorPlaca(dto.placa.trim());
    } catch {
      throw new NotFoundException('No se ha encontrado información');
    }
  }
}
