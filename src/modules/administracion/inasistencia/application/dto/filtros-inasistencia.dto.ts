import { IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FiltrosInasistenciaDto {
    @IsOptional()
    @IsNumber()
    @ApiProperty({ example: 123, description: 'ID del empleado', required: false })
    empleado?: number;

    @IsOptional()
    @IsDateString()
    @ApiProperty({ example: '2025-01-01', description: 'Fecha inicio', required: false })
    fecha_inicio?: string;

    @IsOptional()
    @IsDateString()
    @ApiProperty({ example: '2025-01-31', description: 'Fecha final', required: false })
    fecha_final?: string;
}
