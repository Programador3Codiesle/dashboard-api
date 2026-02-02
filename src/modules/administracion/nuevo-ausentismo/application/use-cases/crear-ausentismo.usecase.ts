import { Injectable, BadRequestException } from '@nestjs/common';
import { INuevoAusentismoRepository } from '../../domain/nuevo-ausentismo.repository';
import { CreateAusentismoDto } from '../dto/create-ausentismo.dto';

@Injectable()
export class CrearAusentismoUseCase {
    constructor(private readonly repo: INuevoAusentismoRepository) {}

    async execute(dto: CreateAusentismoDto, userId: number) {

        // Parsear 'YYYY-MM-DD' como fecha local (evita que UTC reste un día en zonas UTC-)
        const [y, m, d] = dto.fecha_ini.split('-').map(Number);
        const fechaIni = new Date(y, m - 1, d);
        const fechaFin = new Date(y, m - 1, d); // Mismo día, máximo un día

        // Validar que no sea fecha pasada
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        if (fechaIni < hoy) {
            throw new BadRequestException('No se puede crear un ausentismo para fechas pasadas');
        }

        // Validar que sea solo un día
        const diferenciaDias = Math.floor((fechaFin.getTime() - fechaIni.getTime()) / (1000 * 60 * 60 * 24));
        if (diferenciaDias > 0) {
            throw new BadRequestException('Los ausentismos solo se pueden deligenciar máximo por un día');
        }

        return this.repo.create({
            empleado: userId,
            area: dto.area,
            cargo_emp: dto.cargo_emp,
            sede: dto.sede,
            fecha_ini: fechaIni,
            hora_ini: dto.hora_ini,
            fecha_fin: fechaFin,
            hora_fin: dto.hora_fin,
            descripcion: dto.descripcion,
            motivo: dto.motivo,
            autorizacion: 0, // Pendiente
            titulo: dto.motivo,
            id_empresa: dto.id_empresa
        });
    }
}
