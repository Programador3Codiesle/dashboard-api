import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { IOrdenSalidaRepository } from '../../domain/orden-salida.repository';

@Injectable()
export class GuardarObservacionOrdenSalidaUseCase {
  constructor(private readonly repo: IOrdenSalidaRepository) {}

  async execute(id: number, observacion: string, idUsuario: number | null) {
    const idsConPermiso = new Set([460, 625, 814, 826]);
    if (!idUsuario || !idsConPermiso.has(idUsuario)) {
      throw new ForbiddenException('No tiene permisos para guardar observaciones en este informe');
    }
    if (!observacion || !observacion.trim()) {
      throw new BadRequestException('La observación es obligatoria');
    }
    await this.repo.guardarObservacion(id, observacion.trim());
  }
}

