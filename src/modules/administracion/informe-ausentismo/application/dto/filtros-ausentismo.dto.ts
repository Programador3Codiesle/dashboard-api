import { IsOptional, IsDateString, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FiltrosAusentismoDto {
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
    @ApiProperty({ example: 'Central de beneficios', description: 'Central de beneficios', required: false })
    central_beneficios?: string;
}
