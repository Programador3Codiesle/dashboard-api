import { Injectable } from '@nestjs/common';
import { ObtenerTallaDotacionUseCase } from './use-cases/obtener-talla-dotacion.usecase';
import { ActualizarTallaDotacionUseCase } from './use-cases/actualizar-talla-dotacion.usecase';
import { UpdateTallaDotacionDto } from './dto/update-talla-dotacion.dto';

@Injectable()
export class TallaDotacionFacade {
    constructor(
        private readonly obtenerTallaUC: ObtenerTallaDotacionUseCase,
        private readonly actualizarTallaUC: ActualizarTallaDotacionUseCase
    ) {}

    obtenerTallas(usuarioId: number, idEmpresa?: number) {
        return this.obtenerTallaUC.execute(usuarioId, idEmpresa);
    }

    actualizarTallas(usuarioId: number, dto: UpdateTallaDotacionDto) {
        return this.actualizarTallaUC.execute(usuarioId, dto);
    }
}
