import { BadRequestException, Injectable } from '@nestjs/common';
import { IAuditoriaRepository } from '../../domain/auditoria.repository';

@Injectable()
export class OrdenesDiariasUseCase {
  constructor(private readonly repo: IAuditoriaRepository) {}

  execute(fecha: string, bodega: string) {
    if (!fecha || !bodega) {
      throw new BadRequestException('Fecha y bodega son requeridos');
    }
    const [y, m, d] = fecha.split('-').map(Number);
    if (!y || !m || !d) throw new BadRequestException('Fecha inválida');
    return this.repo.ordenesDiarias(y, m, d, Number(bodega));
  }
}
