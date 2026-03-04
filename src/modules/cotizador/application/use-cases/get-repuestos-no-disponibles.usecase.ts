import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ICotizadorRepuestosNoDispRepository,
  RepuestoNoDisponibleRow,
} from '../../domain/cotizador-repuestos-no-disp.repository';

export interface RepuestosNoDisponiblesParams {
  dateStart: string;
  dateEnd: string;
  bodega?: number | null;
}

@Injectable()
export class GetRepuestosNoDisponiblesUseCase {
  constructor(
    private readonly repo: ICotizadorRepuestosNoDispRepository,
  ) {}

  async execute(
    params: RepuestosNoDisponiblesParams,
  ): Promise<RepuestoNoDisponibleRow[]> {
    const { dateStart, dateEnd, bodega } = params;

    if (!dateStart || !dateEnd) {
      throw new BadRequestException(
        'Se requieren fecha inicio y fecha final para consultar repuestos no disponibles.',
      );
    }

    if (dateStart > dateEnd) {
      throw new BadRequestException(
        'La fecha de inicio debe ser menor o igual a la fecha final.',
      );
    }

    return this.repo.getRepuestosNoDisponibles(
      dateStart,
      dateEnd,
      bodega ?? null,
    );
  }
}
