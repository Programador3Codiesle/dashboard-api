import { Injectable, NotFoundException } from '@nestjs/common';
import { IControlVehiculoRepository } from '../../domain/control-vehiculo.repository';
import { RegistrarSalidaDto } from '../dto/registrar-salida.dto';
import { RegistrarSalidaResponseDto } from '../dto/registrar-salida-response.dto';
import { ControlVehiculoMapper } from '../../presentation/mappers/control-vehiculo.mapper';

@Injectable()
export class RegistrarSalidaUseCase {
    constructor(private readonly repo: IControlVehiculoRepository) {}

    async execute(dto: RegistrarSalidaDto, userId: number): Promise<RegistrarSalidaResponseDto> {

        // Obtener el perfil desde donde corresponda (por ejemplo, de los datos de la sesión/userId/token...)
        // Aquí se mantiene el valor fijo como ejemplo; reemplazar por la obtención real del perfil
        const perfil: number = 7; // TODO: Reemplazar con el valor real consultado de la sesión

        const perfilesVigilancia: { [key: number]: string } = {
            7: 'Vigilancia Giron',
            45: 'Vigilancia Bocono',
            59: 'Vigilancia Rosita',
            60: 'Vigilancia Barranca',
        };

        const porteria = perfilesVigilancia[perfil] ?? `Otro Usuario de perfil ${perfil}`;


        if (!porteria) {
            throw new NotFoundException('Portería no encontrada');
        }


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
