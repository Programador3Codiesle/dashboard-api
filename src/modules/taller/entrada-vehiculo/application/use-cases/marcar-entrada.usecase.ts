import { BadRequestException, Injectable } from '@nestjs/common';
import { IEntradaVehiculoRepository } from '../../domain/entrada-vehiculo.repository';

function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

@Injectable()
export class MarcarEntradaUseCase {
  constructor(private readonly repo: IEntradaVehiculoRepository) {}

  async execute(idCita: number): Promise<{ ok: boolean }> {
    const fechaHoraIni = await this.repo.getCitaFechaHoraIni(idCita);
    if (!fechaHoraIni) {
      throw new BadRequestException('Cita no encontrada');
    }

    const hoy = new Date();
    if (!sameCalendarDay(fechaHoraIni, hoy)) {
      throw new BadRequestException(
        'No puede marcar la entrada si la fecha no corresponde a la fecha programada',
      );
    }

    const ok = await this.repo.insertEntradaVh(idCita);
    return { ok };
  }
}
