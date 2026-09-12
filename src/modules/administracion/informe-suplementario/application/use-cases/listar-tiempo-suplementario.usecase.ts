import { Injectable } from '@nestjs/common';
import {
  IInformeTiempoSuplementarioRepository,
  type SesionInformeHe,
} from '../../domain/informe-tiempo-suplementario.repository';
import { FiltrosTiempoSuplementarioDto } from '../dto/filtros-tiempo-suplementario.dto';

@Injectable()
export class ListarTiempoSuplementarioUseCase {
  constructor(private readonly repo: IInformeTiempoSuplementarioRepository) {}

  async execute(
    filtros: FiltrosTiempoSuplementarioDto | undefined,
    sesion: SesionInformeHe,
  ) {
    return this.repo.listar(filtros, sesion);
  }
}
