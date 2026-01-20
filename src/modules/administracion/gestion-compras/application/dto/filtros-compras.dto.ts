import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FiltrosComprasDto {
    @IsOptional()
    @IsString()
    @ApiProperty({ example: '', description: 'Búsqueda general', required: false })
    buscar?: string;

    @IsOptional()
    @IsNumber()
    @ApiProperty({ example: 1, description: 'Página', required: false })
    pagina?: number;

    @IsOptional()
    @IsNumber()
    @ApiProperty({ example: 10, description: 'Límite por página', required: false })
    limite?: number;
}
