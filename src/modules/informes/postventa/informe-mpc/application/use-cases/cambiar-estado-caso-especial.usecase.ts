import { Injectable, BadRequestException } from '@nestjs/common';
import { IMpcRepository } from '../../domain/mpc.repository';

@Injectable()
export class CambiarEstadoCasoEspecialUseCase {
  constructor(private readonly repo: IMpcRepository) {}

  async execute(placa: string, estado: number, userId: number): Promise<void> {
    if (!placa) {
      throw new BadRequestException(
        'No se ha recibido la placa del vehículo.',
      );
    }

    if (!userId) {
      throw new BadRequestException(
        'La sesión del usuario no es válida para auditar el cambio.',
      );
    }

    await this.repo.cambiarEstadoCasoEspecial(placa, estado, userId);
  }
}

