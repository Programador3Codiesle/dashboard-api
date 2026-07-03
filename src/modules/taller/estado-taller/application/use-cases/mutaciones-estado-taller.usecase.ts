import { BadRequestException, Injectable } from '@nestjs/common';
import { IEstadoTallerRepository } from '../../domain/estado-taller.repository';
import type { MutationResultEntity } from '../../domain/estado-taller.entity';
import {
  AgregarEventoDto,
  FacturaMesActualDto,
  ValoresEstimadosDto,
} from '../dto/estado-taller.dto';

function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

@Injectable()
export class AgregarEventoOtUseCase {
  constructor(private readonly repo: IEstadoTallerRepository) {}

  async execute(dto: AgregarEventoDto): Promise<{ ok: boolean }> {
    if (!dto.estado.trim() || !dto.notas.trim() || !dto.ot) {
      throw new BadRequestException('Todos los campos deben ser completados');
    }

    let fecPromesa = dto.fecPromesaEntrega?.trim() || null;
    if (!fecPromesa) {
      fecPromesa = await this.repo.getFecPromesaEntrega(dto.ot);
    }

    const ok = await this.repo.addEvento({
      ot: dto.ot,
      notas: dto.notas.trim(),
      estado: dto.estado.trim(),
      fecha: todayIsoDate(),
      proceso: '',
      fecPromesaEntrega: fecPromesa,
    });

    return { ok };
  }
}

@Injectable()
export class GuardarFacturaMesActualUseCase {
  constructor(private readonly repo: IEstadoTallerRepository) {}

  async execute(
    userId: number,
    dto: FacturaMesActualDto,
  ): Promise<MutationResultEntity> {
    if (dto.estado !== 0 && dto.estado !== 1) {
      throw new BadRequestException('Estado inválido');
    }

    const exists = await this.repo.existeEstimado(dto.numeroOrden);
    const payload = {
      numero_orden: dto.numeroOrden,
      mes_fact_est: dto.estado,
    };

    const ok = exists
      ? await this.repo.updateEstimado(userId, dto.numeroOrden, {
          mes_fact_est: dto.estado,
        })
      : await this.repo.insertEstimado(userId, payload);

    if (!ok) {
      return {
        ok: false,
        title: 'Advertencia',
        message: 'Ha ocurrido un error al intentar registrar la información',
        icon: 'warning',
      };
    }

    return {
      ok: true,
      title: 'Exito',
      message: '¡Factura Mes Actual Registrado!',
      icon: 'success',
    };
  }
}

@Injectable()
export class GuardarValoresEstimadosUseCase {
  constructor(private readonly repo: IEstadoTallerRepository) {}

  async execute(
    userId: number,
    dto: ValoresEstimadosDto,
  ): Promise<MutationResultEntity> {
    const exists = await this.repo.existeEstimado(dto.inputNumeroOr);
    const payload = {
      numero_orden: dto.inputNumeroOr,
      v_mano_obra_est: dto.inputMO,
      v_rpto_est: dto.inputRpto,
      v_tot_est: dto.inputToT,
    };

    const ok = exists
      ? await this.repo.updateEstimado(userId, dto.inputNumeroOr, {
          v_mano_obra_est: dto.inputMO,
          v_rpto_est: dto.inputRpto,
          v_tot_est: dto.inputToT,
        })
      : await this.repo.insertEstimado(userId, payload);

    if (!ok) {
      return {
        ok: false,
        title: 'Advertencia',
        message: 'Ha ocurrido un error al intentar registrar la información',
        icon: 'warning',
      };
    }

    return {
      ok: true,
      title: 'Exito',
      message: '¡Valores registrados con exito!',
      icon: 'success',
    };
  }
}
