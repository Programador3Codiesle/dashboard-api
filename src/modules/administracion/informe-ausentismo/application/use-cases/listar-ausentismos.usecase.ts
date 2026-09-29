import { Injectable } from '@nestjs/common';
import { IAusentismoRepository } from '../../domain/ausentismo.repository';
import { FiltrosAusentismoDto } from '../dto/filtros-ausentismo.dto';

export type SesionInformeAusentismo = {
  nit: string;
  perfil: number;
};

@Injectable()
export class ListarAusentismosUseCase {
  constructor(private readonly repo: IAusentismoRepository) {}

  async execute(
    filtros?: FiltrosAusentismoDto,
    sesion?: SesionInformeAusentismo,
  ) {
    return this.repo.listar({ ...filtros, sesion });
  }
}
