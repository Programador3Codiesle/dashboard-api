import { BadRequestException, Injectable } from '@nestjs/common';
import { ICotizadorAdicionalesPesadosRepository } from '../../domain/cotizador-adicionales-pesados.repository';

export interface CrearAdicionalPesadoDTO {
  nombre: string;
}

@Injectable()
export class CrearAdicionalPesadosUseCase {
  constructor(
    private readonly repo: ICotizadorAdicionalesPesadosRepository,
  ) {}

  async execute(dto: CrearAdicionalPesadoDTO): Promise<void> {
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

