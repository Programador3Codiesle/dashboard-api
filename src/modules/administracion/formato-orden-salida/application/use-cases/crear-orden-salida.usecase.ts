import { Injectable } from '@nestjs/common';
import { CrearOrdenSalidaDto } from '../dto/crear-orden-salida.dto';
import {
  CrearOrdenSalidaData,
  IOrdenSalidaRepository,
} from '../../domain/orden-salida.repository';

@Injectable()
export class CrearOrdenSalidaUseCase {
  constructor(private readonly repo: IOrdenSalidaRepository) {}

  async execute(userNit: number, dto: CrearOrdenSalidaDto) {
    const payload: CrearOrdenSalidaData = {
      fecha_salida: dto.fecha_salida,
      area: dto.area,
      sede: dto.sede,
      // El jefe autorizado viene del formulario (nit del jefe),
      // mientras que persona_reg es el usuario autenticado.
      jefe: dto.jefe,
      tipoSalida: dto.tipoSalida,
      quienSale: dto.quienSale,
      placa: dto.placa ?? null,
      conductor: dto.conductor ?? null,
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
