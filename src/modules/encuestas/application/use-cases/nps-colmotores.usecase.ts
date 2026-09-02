import { BadRequestException, Injectable } from '@nestjs/common';
import { IEncuestasRepository } from '../../domain/encuestas.repository';

@Injectable()
export class NpsColmotoresUseCase {
  constructor(private readonly repo: IEncuestasRepository) {}

  listarTecnicos() {
    return this.repo.listarTecnicosNps();
  }

  async insertNpsSede(body: {
    sede: string;
    fecha: string;
    calificacion: number;
    cal06: number;
    cal78: number;
    cal910: number;
  }) {
    const { sede, fecha, calificacion, cal06, cal78, cal910 } = body;
    if (!sede || !fecha || calificacion == null) {
      throw new BadRequestException('Campos requeridos incompletos');
    }
    const n = await this.repo.contarNpsSede(fecha, sede);
    const data = { sede, fecha, calificacion, cal06, cal78, cal910 };
    const ok =
      n > 0
        ? await this.repo.updateNpsSede(data)
        : await this.repo.insertNpsSede(data);
    if (!ok) throw new BadRequestException('Error al guardar NPS sede');
    return { ok: true, updated: n > 0 };
  }

  async insertNpsTecnico(body: {
    sede: string;
    tecnico: string;
    fecha: string;
    calificacion: number;
    placa: string;
    tipificacion: string;
    tipo_cal: '0a6' | '7a8' | '9a10';
  }) {
    const {
      sede,
      tecnico,
      fecha,
      calificacion,
      placa,
      tipificacion,
      tipo_cal,
    } = body;
    if (
      !sede ||
      !tecnico ||
      !fecha ||
      calificacion == null ||
      !placa ||
      !tipo_cal
    ) {
      throw new BadRequestException('Campos requeridos incompletos');
    }
    let encu06 = 0;
    let encu78 = 0;
    let encu910 = 0;
    switch (tipo_cal) {
      case '0a6':
        encu06 = 1;
        break;
      case '7a8':
        encu78 = 1;
        break;
      case '9a10':
        encu910 = 1;
        break;
      default:
        throw new BadRequestException('tipo_cal inválido');
    }

    const n = await this.repo.contarNpsTecnico(fecha, tecnico);
    const data = {
      sede,
      tecnico,
      fecha,
      calificacion,
      placa,
      tipificacion: tipificacion || 'Ninguno',
      encu06,
      encu78,
      encu910,
    };

    if (n === 1) {
      const ok = await this.repo.updateNpsTecnico(data);
      if (!ok) throw new BadRequestException('Error al actualizar NPS técnico');
      return { ok: true, updated: true };
    }
    if (n === 0) {
      const ok = await this.repo.insertNpsTecnico(data);
      if (!ok) throw new BadRequestException('Error al insertar NPS técnico');
      return { ok: true, updated: false };
    }
    return { ok: true, skipped: true };
  }
}
