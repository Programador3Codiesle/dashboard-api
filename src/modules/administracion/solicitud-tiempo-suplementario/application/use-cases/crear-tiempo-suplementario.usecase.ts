import { Injectable } from '@nestjs/common';
import { ITiempoSuplementarioRepository } from '../../domain/tiempo-suplementario.repository';
import { CreateTiempoSuplementarioDto } from '../dto/create-tiempo-suplementario.dto';

@Injectable()
export class CrearTiempoSuplementarioUseCase {
    constructor(private readonly repo: ITiempoSuplementarioRepository) {}

    async execute(dto: CreateTiempoSuplementarioDto) {
        const fechaIni = new Date(dto.fecha_ini);
        
        return this.repo.create({
            empleado: dto.empleado,
            area: dto.area,
            cargo_emp: dto.cargo_emp,
            sede: dto.sede,
            fecha_ini: fechaIni,
            hora_ini: dto.hora_ini,
            hora_fin: dto.hora_fin,
            descripcion: dto.descripcion,
            estado: 0 // Pendiente
        });
    }
}
