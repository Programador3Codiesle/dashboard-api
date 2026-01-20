import { Injectable } from '@nestjs/common';
import { IInasistenciaRepository } from '../../domain/inasistencia.repository';
import { FiltrosInasistenciaDto } from '../dto/filtros-inasistencia.dto';

@Injectable()
export class ListarInasistenciasUseCase {
    constructor(private readonly repo: IInasistenciaRepository) {}

    async execute(filtros?: FiltrosInasistenciaDto) {
        return this.repo.listar(filtros);
    }
}
