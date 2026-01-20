import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTiempoSuplementarioDto {
    @IsDateString()
    @ApiProperty({ example: '2025-01-15', description: 'Fecha de inicio jornada adicional' })
    fecha_ini: string;

    @IsString()
    @ApiProperty({ example: '18:00', description: 'Hora de inicio jornada adicional' })
    hora_ini: string;

    @IsString()
    @ApiProperty({ example: '22:00', description: 'Hora de finalización jornada adicional' })
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

    @IsNumber()
    @ApiProperty({ example: 123, description: 'ID del empleado' })
    empleado: number;

    @IsString()
    @ApiProperty({ example: 'Descripción del motivo', description: 'Describe el motivo de la solicitud' })
    descripcion: string;
}
