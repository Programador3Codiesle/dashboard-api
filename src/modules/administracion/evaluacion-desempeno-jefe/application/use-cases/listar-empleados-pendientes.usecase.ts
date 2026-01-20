import { Injectable } from '@nestjs/common';
import { IEvaluacionDesempenoRepository } from '../../domain/repositories/evaluacion-desempeno.repository';
import { EvaluacionDesempenoMapper } from '../../presentation/mappers/evaluacion-desempeno.mapper';

@Injectable()
export class ListarEmpleadosPendientesUseCase {
    constructor(private readonly repo: IEvaluacionDesempenoRepository) {}


    async obtenerIdJefe(nit_usuario: number) {
        const jefe = await this.repo.obtenerIdJefe(nit_usuario);
        return { jefe };
    }

    async execute(jefeId: number) {
        const empleados = await this.repo.listarEmpleadosPendientes(jefeId);
        return EvaluacionDesempenoMapper.toEmpleadosPendientesResponse(empleados);
    }
}

