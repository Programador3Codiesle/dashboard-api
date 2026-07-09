import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { GuardarDefinicionDto } from '../dto/guardar-definicion.dto';
import { IPosiblesRetornosRepository } from '../../domain/repositories/posibles-retornos.repository.interface';

function emptyToNull<T>(value: T | undefined | ''): T | null {
  if (value === undefined || value === '') return null;
  return value;
}

function formatFechaCreacion(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

@Injectable()
export class GuardarDefinicionUseCase {
  constructor(private readonly repository: IPosiblesRetornosRepository) {}

  async execute(dto: GuardarDefinicionDto, usuario: string) {
    if (!usuario) {
      throw new BadRequestException('Usuario no identificado');
    }

    const ok = await this.repository.guardarDefinicion({
      definicion: dto.definicion,
      id_razon: emptyToNull(dto.selectRazon),
      obs_razon: emptyToNull(dto.obs_razon),
      id_sist_inv: emptyToNull(dto.select_sist_inv),
      obs_sist_inv: emptyToNull(dto.obs_sist_inv),
      numero_retorno: emptyToNull(dto.ordenR),
      numero: dto.ordenR_origen,
      tecnico: emptyToNull(dto.tecnicoR),
      id_plan: emptyToNull(dto.selectPlan),
      obs_plan: emptyToNull(dto.obs_plan),
      repuestos: emptyToNull(dto.precio_costo_1),
      mano_obra: emptyToNull(dto.precio_costo_2),
      tot: emptyToNull(dto.precio_costo_3),
      obs_costo: emptyToNull(dto.obs_costos),
      fecha_creacion: formatFechaCreacion(),
      usuario,
    });

    if (!ok) {
      throw new InternalServerErrorException(
        'No se ha podido guardar la información',
      );
    }

    return { response: 'success' as const };
  }
}
