import { Injectable, NotFoundException } from '@nestjs/common';
import { IControlVehiculoRepository } from '../../domain/control-vehiculo.repository';
import { RegistrarSalidaDto } from '../dto/registrar-salida.dto';
import { RegistrarSalidaResponseDto } from '../dto/registrar-salida-response.dto';
import { ControlVehiculoMapper } from '../../presentation/mappers/control-vehiculo.mapper';

@Injectable()
export class RegistrarSalidaUseCase {
    constructor(private readonly repo: IControlVehiculoRepository) {}

    async execute(dto: RegistrarSalidaDto, userId: number, perfil: number): Promise<RegistrarSalidaResponseDto> {
        // Mapeo de perfiles de vigilancia a nombres de portería
        const perfilesVigilancia: { [key: number]: string } = {
            7: 'Vigilancia Giron',
            45: 'Vigilancia Bocono',
            59: 'Vigilancia Rosita',
            60: 'Vigilancia Barranca',
        };

        // Si el perfil está en la lista de vigilancia, usar el nombre de la portería
        // Si no, usar un texto genérico pero permitir la creación
        const porteria = perfilesVigilancia[perfil] || `Otro Usuario de perfil ${perfil}`;


        const result = await this.repo.registrarSalida({
            ...dto,
            km_salida: BigInt(dto.km_salida),
            modelo: dto.modelo || undefined,
            fecha_salida: new Date(),
            porteria: porteria
        });

        if (result.data) {
            return {
                status: result.status,
                message: result.message,
                data: ControlVehiculoMapper.toRegistrarSalidaResponseDto(result.data)
            };
        }

        return {
            status: result.status,
            message: result.message
        };
    }
}
