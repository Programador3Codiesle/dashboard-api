import { BadRequestException, Injectable } from '@nestjs/common';
import { IOrdenesTotRepository } from '../../domain/ordenes-tot.repository';
import { ResolverSedesUseCase } from './resolver-sedes.usecase';

@Injectable()
export class GestionPorteriaUseCase {
  constructor(
    private readonly repo: IOrdenesTotRepository,
    private readonly resolverSedes: ResolverSedesUseCase,
  ) {}

  async vehiculos() {
    return this.repo.infoVehiculoPorteria();
  }

  async tot(idUsuario: number, nit?: number) {
    const sedes = await this.resolverSedes.execute(idUsuario, nit);
    if (sedes.length === 0) return [];
    return this.repo.infoTotPorteria(sedes);
  }

  async ordenesGenerales() {
    return this.repo.infoOrdGralPorteria();
  }

  async confirmarSalida(idVehiculo: number) {
    const ok = await this.repo.confirmarSalida(idVehiculo);
    if (!ok) {
      throw new BadRequestException('No se pudo confirmar la salida');
    }
    return { ok: true };
  }
}
