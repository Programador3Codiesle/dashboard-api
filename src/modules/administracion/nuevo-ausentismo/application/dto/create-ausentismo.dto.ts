import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAusentismoDto {
    @IsDateString()
    @ApiProperty({ example: '2025-01-15', description: 'Fecha en la que se ausentará' })
    fecha_ini: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ example: '08:00', description: 'Hora inicio ausentismo', required: false })
    hora_ini?: string;

    @IsString()
    @ApiProperty({ example: '17:00', description: 'Hora en que termina el ausentismo' })
    hora_fin: string;

    @IsString()
    @ApiProperty({ example: 'Sistemas', description: 'Área donde labora' })
    area: string;

    @IsString()
    @ApiProperty({ example: 'Desarrollador', description: 'Cargo del empleado' })
    cargo_emp: string;

    @IsString()
    @ApiProperty({ example: 'Bucaramanga', description: 'Sede' })
    sede: string;

    @IsString()
    @ApiProperty({ example: 'Permiso médico', description: 'Motivo del permiso' })
    motivo: string;

    @IsString()
    @ApiProperty({ example: 'Descripción detallada del motivo', description: 'Describe el motivo del permiso' })
    descripcion: string;

    @IsNumber()
    @ApiProperty({ example: 1, description: 'ID de la empresa (desde cookie/contexto)' })
    id_empresa: number;
}
