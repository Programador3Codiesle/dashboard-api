import { Injectable } from '@nestjs/common';
import { IControlVehiculoRepository } from '../../domain/control-vehiculo.repository';
import { ListarVehiculosResponseDto } from '../dto/listar-vehiculos-response.dto';
import { ControlVehiculoMapper } from '../../presentation/mappers/control-vehiculo.mapper';

@Injectable()
export class ListarVehiculosUseCase {
    constructor(private readonly repo: IControlVehiculoRepository) {}

    async execute(): Promise<ListarVehiculosResponseDto[]> {
        const entities = await this.repo.listar();
        // Usar el mapper para convertir las entidades a DTOs de respuesta
        return entities.map(entity => 
            ControlVehiculoMapper.toListResponseDto(entity, entity.modelo_descripcion, entity.empresa_nombre)
        );
    }
}
