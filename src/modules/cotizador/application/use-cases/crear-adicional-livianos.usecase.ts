import { BadRequestException, Injectable } from '@nestjs/common';
import { ICotizadorAdicionalesLivianosRepository } from '../../domain/cotizador-adicionales-livianos.repository';

export interface CrearAdicionalLivianoDTO {
  nombre: string;
}

@Injectable()
export class CrearAdicionalLivianosUseCase {
  constructor(private readonly repo: ICotizadorAdicionalesLivianosRepository) {}

  async execute(dto: CrearAdicionalLivianoDTO): Promise<void> {
    const nombre = dto.nombre?.trim().toUpperCase();

    if (!nombre) {
      throw new BadRequestException('El nombre del adicional es obligatorio.');
    }

    const exists = await this.repo.existsAdicionalNombre(nombre);
    if (exists) {
      throw new BadRequestException(
        `El adicional "${nombre}" ya se encuentra registrado.`,
      );
    }

    await this.repo.createAdicionalNombre(nombre);
  }
}
