import { IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FiltrosInasistenciaDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @ApiProperty({ example: 1095944273, description: 'NIT (documento) del empleado para filtrar', required: false })
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
