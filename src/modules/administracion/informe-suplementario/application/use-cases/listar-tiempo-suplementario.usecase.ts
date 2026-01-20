import { Injectable } from '@nestjs/common';
import { IInformeTiempoSuplementarioRepository } from '../../domain/informe-tiempo-suplementario.repository';
import { FiltrosTiempoSuplementarioDto } from '../dto/filtros-tiempo-suplementario.dto';

@Injectable()
export class ListarTiempoSuplementarioUseCase {
    constructor(private readonly repo: IInformeTiempoSuplementarioRepository) {}

    async execute(filtros?: FiltrosTiempoSuplementarioDto) {
        return this.repo.listar(filtros);
    }
}
