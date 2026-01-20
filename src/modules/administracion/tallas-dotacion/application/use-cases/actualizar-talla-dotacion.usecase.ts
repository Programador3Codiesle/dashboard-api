import { Injectable } from '@nestjs/common';
import { ITallaDotacionRepository } from '../../domain/talla-dotacion.repository';
import { UpdateTallaDotacionDto } from '../dto/update-talla-dotacion.dto';

@Injectable()
export class ActualizarTallaDotacionUseCase {
    constructor(private readonly repo: ITallaDotacionRepository) {}

    async execute(usuarioId: number, dto: UpdateTallaDotacionDto) {
        return this.repo.actualizarTallas(usuarioId, {
            ...dto,
            ultima_actualizacion: new Date()
        });
    }
}
