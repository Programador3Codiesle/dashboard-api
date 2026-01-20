import { IsOptional, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FiltrosTiempoSuplementarioDto {
    @IsOptional()
    @IsNumber()
    @ApiProperty({ example: 1, description: 'Mes', required: false })
    mes?: number;

    @IsOptional()
    @IsString()
    @ApiProperty({ example: 'Bucaramanga', description: 'Sede', required: false })
    sede?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ example: 'Sistemas', description: 'Área', required: false })
    area?: string;

    @IsOptional()
    @IsNumber()
    @ApiProperty({ example: 123, description: 'Empleado', required: false })
    empleado?: number;

    @IsOptional()
    @IsString()
    @ApiProperty({ example: '', description: 'Búsqueda', required: false })
    buscar?: string;
}
