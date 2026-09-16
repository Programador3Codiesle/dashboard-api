import { Injectable } from '@nestjs/common';
import { IControlVehiculoRepository } from '../../domain/control-vehiculo.repository';
import { RegistrarLlegadaDto } from '../dto/registrar-llegada.dto';
import { RegistrarLlegadaResponseDto } from '../dto/registrar-llegada-response.dto';
import { ControlVehiculoMapper } from '../../presentation/mappers/control-vehiculo.mapper';

@Injectable()
export class RegistrarLlegadaUseCase {
  constructor(private readonly repo: IControlVehiculoRepository) {}

  async execute(
    id: number,
    dto: RegistrarLlegadaDto,
    idEmpresa: number,
  ): Promise<RegistrarLlegadaResponseDto> {
    const observacion = dto.observacion?.trim()
      ? dto.observacion.trim()
      : undefined;

    const result = await this.repo.registrarLlegada(
      id,
      BigInt(dto.km_llegada),
      idEmpresa,
      observacion,
    );

    if (result.data) {
      return {
        status: result.status,
        message: result.message,
        data: ControlVehiculoMapper.toRegistrarLlegadaResponseDto(result.data),
      };
    }

    return {
      status: result.status,
      message: result.message,
    };
  }
}
