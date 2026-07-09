import { Injectable, NotFoundException } from '@nestjs/common';
import { SolucionOrdenDto } from '../dto/solucion-orden.dto';
import { IPosiblesRetornosRepository } from '../../domain/repositories/posibles-retornos.repository.interface';

@Injectable()
export class ObtenerSolucionUseCase {
  constructor(private readonly repository: IPosiblesRetornosRepository) {}

  async execute(dto: SolucionOrdenDto) {
    const solucion = await this.repository.obtenerSolucion(dto.numero);
    if (!solucion) {
      throw new NotFoundException('No se encontró solución');
    }
    return { response: 'success' as const, solucion };
  }
}
