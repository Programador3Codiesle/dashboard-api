import { Injectable, BadRequestException } from '@nestjs/common';
import { ITiempoSuplementarioRepository } from '../../domain/tiempo-suplementario.repository';
import { CreateTiempoSuplementarioDto } from '../dto/create-tiempo-suplementario.dto';

@Injectable()
export class CrearTiempoSuplementarioUseCase {
    constructor(private readonly repo: ITiempoSuplementarioRepository) {}

    async execute(dto: CreateTiempoSuplementarioDto, userId: number) {
        const [y, m, d] = dto.fecha_ini.split('-').map(Number);
        const fechaIni = new Date(y, m - 1, d);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        if (fechaIni < hoy) {
            throw new BadRequestException('No se puede crear una solicitud para fechas pasadas');
        }
        const nit_empleado = dto.empleado ?? userId;
        return this.repo.create({
            nit_jefe: userId,
            nit_empleado,
            fecha_ini: fechaIni,
            hora_ini: dto.hora_ini,
            hora_fin: dto.hora_fin,
            fecha_solicitud: new Date(),
            area: dto.area,
            cargo: dto.cargo_emp,
            sede: dto.sede,
            descripcion: dto.descripcion,
            autorizacion: 0,
            autorizacionporteria: null,
            id_empresa: dto.id_empresa,
        });
    }
}
