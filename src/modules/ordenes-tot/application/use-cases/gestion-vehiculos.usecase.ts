import { Injectable } from '@nestjs/common';
import { IOrdenesTotRepository } from '../../domain/ordenes-tot.repository';
import { CrearVehiculoDto } from '../dto/crear-vehiculo.dto';
import { ResolverSedesUseCase } from './resolver-sedes.usecase';

@Injectable()
export class GestionVehiculosUseCase {
  constructor(
    private readonly repo: IOrdenesTotRepository,
    private readonly resolverSedes: ResolverSedesUseCase,
  ) {}

  async crear(dto: CrearVehiculoDto, idUsuario: number) {
    await this.repo.insertVehiculoORepuesto(
      String(dto.placa).trim(),
      String(dto.orden).trim(),
      idUsuario,
      'vehiculo',
    );
    return { ok: true };
  }

  async listarPendientes(idUsuario: number, nit?: number) {
    const sedes = await this.resolverSedes.execute(idUsuario, nit);
    if (sedes.length === 0) return [];
    return this.repo.listarVehiculosPendientes(sedes);
  }
}
