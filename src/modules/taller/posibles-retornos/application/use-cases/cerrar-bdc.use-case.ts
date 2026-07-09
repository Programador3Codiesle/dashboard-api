import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CerrarBdcDto } from '../dto/cerrar-bdc.dto';
import { IPosiblesRetornosRepository } from '../../domain/repositories/posibles-retornos.repository.interface';

function formatFecha(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

@Injectable()
export class CerrarBdcUseCase {
  constructor(private readonly repository: IPosiblesRetornosRepository) {}

  async execute(dto: CerrarBdcDto, usuario: string) {
    const ok = await this.repository.cerrarBdc(
      dto.idPosibleBdc,
      usuario,
      formatFecha(),
    );

    if (!ok) {
      throw new InternalServerErrorException(
        'No se ha podido guardar la información',
      );
    }

    return { response: 'success' as const };
  }
}
