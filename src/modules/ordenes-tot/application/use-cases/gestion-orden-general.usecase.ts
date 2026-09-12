import { Injectable } from '@nestjs/common';
import { IOrdenesTotRepository } from '../../domain/ordenes-tot.repository';
import { CrearOrdenGeneralDto } from '../dto/crear-orden-general.dto';

@Injectable()
export class GestionOrdenGeneralUseCase {
  constructor(private readonly repo: IOrdenesTotRepository) {}

  async crear(dto: CrearOrdenGeneralDto, idUsuario: number) {
    await this.repo.insertOrdenGeneral(
      String(dto.serial).trim(),
      String(dto.descripcion ?? '').trim(),
      idUsuario,
    );
    return { ok: true };
  }

  listarPendientes(idUsuario: number) {
    return this.repo.listarOrdenGeneralPendientes(idUsuario);
  }
}
