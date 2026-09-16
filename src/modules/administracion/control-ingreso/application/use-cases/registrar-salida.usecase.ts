import { BadRequestException, Injectable } from '@nestjs/common';
import { IControlVehiculoRepository } from '../../domain/control-vehiculo.repository';
import { ControlVehiculoEntity } from '../../domain/control-vehiculo.entity';
import { RegistrarSalidaDto } from '../dto/registrar-salida.dto';
import { RegistrarSalidaResponseDto } from '../dto/registrar-salida-response.dto';
import { ControlVehiculoMapper } from '../../presentation/mappers/control-vehiculo.mapper';

const TIPO_VEHICULO_REMOLCADO = 'Vehículo Remolcado';
const TIPO_GRUA = 'Grúa';

const PERFILES_VIGILANCIA: Record<number, string> = {
  7: 'Vigilancia Giron',
  45: 'Vigilancia Bocono',
  59: 'Vigilancia Rosita',
  60: 'Vigilancia Barranca',
};

@Injectable()
export class RegistrarSalidaUseCase {
  constructor(private readonly repo: IControlVehiculoRepository) {}

  async execute(
    dto: RegistrarSalidaDto,
    _userId: number,
    perfil: number,
    idEmpresa: number,
  ): Promise<RegistrarSalidaResponseDto> {
    const porteria =
      PERFILES_VIGILANCIA[perfil] ?? `Otro Usuario de perfil ${perfil}`;

    const placa = dto.placa.trim().toUpperCase();
    if (placa.length > 6) {
      throw new BadRequestException(
        'El campo placa debe tener maximo de 6 caracteres',
      );
    }

    if (dto.tipo_vehiculo === TIPO_VEHICULO_REMOLCADO) {
      const placaGrua = (dto.placa_grua ?? '').trim().toUpperCase();
      if (!placaGrua) {
        throw new BadRequestException('El campo placa grua es requerido');
      }
      if (placaGrua.length > 6) {
        throw new BadRequestException(
          'El campo placa grua debe tener maximo de 6 caracteres',
        );
      }

      const grua: Partial<ControlVehiculoEntity> = {
        placa: placaGrua,
        km_salida: BigInt(0),
        taller: dto.taller,
        conductor: 'N/A',
        pasajeros: 'N/A',
        persona_autorizo: 'N/A',
        placa_vh_remolcado: placa,
        tipo_vehiculo: TIPO_GRUA,
        modelo: 0,
        porteria,
        id_empresa: idEmpresa,
      };
      const gruaRes = await this.repo.registrarSalida(grua);
      if (!gruaRes.status) {
        return {
          status: false,
          message: gruaRes.message,
        };
      }
    }

    const remolcado: Partial<ControlVehiculoEntity> = {
      placa,
      km_salida: BigInt(dto.km_salida),
      tipo_vehiculo: dto.tipo_vehiculo,
      modelo: dto.modelo,
      taller: dto.taller,
      conductor: dto.conductor,
      persona_autorizo: dto.persona_autorizo.trim(),
      pasajeros: dto.pasajeros || undefined,
      otra_marca: dto.modelo === -1 ? dto.otra_marca : undefined,
      porteria,
      id_empresa: idEmpresa,
    };

    const result = await this.repo.registrarSalida(remolcado);

    if (result.data) {
      return {
        status: result.status,
        message: result.message,
        data: ControlVehiculoMapper.toRegistrarSalidaResponseDto(result.data),
      };
    }

    return {
      status: result.status,
      message: result.message,
    };
  }
}
