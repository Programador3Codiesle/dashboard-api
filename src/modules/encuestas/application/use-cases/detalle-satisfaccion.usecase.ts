import { BadRequestException, Injectable } from '@nestjs/common';
import { IEncuestasRepository } from '../../domain/encuestas.repository';

@Injectable()
export class DetalleSatisfaccionUseCase {
  constructor(private readonly repo: IEncuestasRepository) {}

  async execute(ot: string) {
    if (!ot?.trim()) {
      throw new BadRequestException('Número de orden requerido');
    }
    const orden = await this.repo.detalleOrdenSatisfaccion(ot.trim());
    const respuestas = await this.repo.respuestasSatisfaccion(ot.trim());
    return { orden, respuestas };
  }
}
