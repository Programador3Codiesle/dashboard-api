import { Injectable, BadRequestException } from '@nestjs/common';
import { ILlegadasTardeRepository } from '../../domain/llegadas-tarde.repository';

@Injectable()
export class ListarResumenLlegadasTardeUseCase {
  constructor(private readonly repo: ILlegadasTardeRepository) {}

  async execute(fechaInicio: string, fechaFin: string) {
    if (!fechaInicio || !fechaFin) {
      throw new BadRequestException('Debe seleccionar dos fechas');
    }
    return this.repo.listarResumen(fechaInicio, fechaFin);
  }
}
