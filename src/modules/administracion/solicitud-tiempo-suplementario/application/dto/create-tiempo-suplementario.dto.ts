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

    @IsString()
    @ApiProperty({ example: 'Descripción del motivo', description: 'Describe el motivo de la solicitud' })
    descripcion: string;

    @IsNumber()
    @ApiProperty({ example: 1, description: 'ID de la empresa (desde cookie/contexto)' })
    id_empresa: number;

    @IsOptional()
    @IsNumber()
    @ApiProperty({ example: 123456789, description: 'NIT del empleado para quien es la solicitud; si no se envía se usa el usuario autenticado', required: false })
    empleado?: number;
}
