import { Injectable } from '@nestjs/common';
import { IOrdenesTotRepository } from '../../domain/ordenes-tot.repository';
import { CrearRepuestoDto } from '../dto/crear-repuesto.dto';

@Injectable()
export class GestionRepuestosUseCase {
  constructor(private readonly repo: IOrdenesTotRepository) {}

  async crear(dto: CrearRepuestoDto, idUsuario: number) {
    await this.repo.insertVehiculoORepuesto(
      String(dto.placa).trim(),
      String(dto.orden).trim(),
      idUsuario,
      'repuesto',
    );
    return { ok: true };
  }

  async listarCandidatos() {
    return this.repo.listarRepuestosCandidatos();
  }
}
