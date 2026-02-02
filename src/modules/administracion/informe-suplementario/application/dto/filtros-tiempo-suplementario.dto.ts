import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FiltrosTiempoSuplementarioDto {
    @IsOptional()
    @IsDateString()
    @ApiProperty({ example: '2025-01-01', description: 'Fecha desde', required: false })
    fecha_desde?: string;

    @IsOptional()
    @IsDateString()
    @ApiProperty({ example: '2025-01-31', description: 'Fecha hasta', required: false })
    fecha_hasta?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ example: 'Bucaramanga', description: 'Sede', required: false })
    sede?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ example: 'Sistemas', description: 'Área', required: false })
    area?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ example: 'Juan Pérez', description: 'Filtrar por nombre del empleado', required: false })
    empleado?: string;
}
