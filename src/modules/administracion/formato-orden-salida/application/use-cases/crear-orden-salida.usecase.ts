import { BadRequestException, Injectable } from '@nestjs/common';
import { CrearOrdenSalidaDto } from '../dto/crear-orden-salida.dto';
import {
  CrearOrdenSalidaData,
  IOrdenSalidaRepository,
} from '../../domain/orden-salida.repository';
import { assertAccesoFormatoOrdenSalida } from '../assert-acceso-formato-orden-salida';
import {
  TIPOS_SALIDA_CON_CONDUCTOR,
  TIPOS_SALIDA_CON_PLACA,
} from '../orden-salida-php.constants';

@Injectable()
export class CrearOrdenSalidaUseCase {
  constructor(private readonly repo: IOrdenSalidaRepository) {}

  async execute(userNit: number, dto: CrearOrdenSalidaDto) {
    assertAccesoFormatoOrdenSalida(userNit);

    const pidePlaca = TIPOS_SALIDA_CON_PLACA.has(dto.tipoSalida);
    const pideConductor = TIPOS_SALIDA_CON_CONDUCTOR.has(dto.tipoSalida);
    const placa = dto.placa?.trim() ?? '';
    const conductor = dto.conductor?.trim() ?? '';

    if (pidePlaca && !placa) {
      throw new BadRequestException(
        'La placa del vehículo es obligatoria para este tipo de salida.',
      );
    }
    if (pideConductor && !conductor) {
      throw new BadRequestException(
        'El conductor es obligatorio para este tipo de salida.',
      );
    }

    const payload: CrearOrdenSalidaData = {
      fecha_salida: dto.fecha_salida,
      area: dto.area,
      sede: dto.sede,
      // El jefe autorizado viene del formulario (nit del jefe),
      // mientras que persona_reg es el usuario autenticado.
      jefe: dto.jefe,
      tipoSalida: dto.tipoSalida,
      quienSale: dto.quienSale,
      placa: pidePlaca ? placa : null,
      conductor: pideConductor ? conductor : null,
      explicacion: dto.explicacion,
      persona_reg: userNit,
      id_empresa: dto.id_empresa,
    };

    const ok = await this.repo.crearOrdenSalida(payload);

    return {
      status: ok,
      message: ok
        ? 'Formato de orden de salida creado correctamente'
        : 'No se pudo crear el formato de orden de salida',
    };
  }
}
