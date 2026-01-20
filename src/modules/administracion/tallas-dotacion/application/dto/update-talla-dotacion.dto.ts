import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTallaDotacionDto {
    @IsOptional()
    @IsString()
    @ApiProperty({ example: 'Masculino', description: 'Género', required: false })
    genero?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ example: 'L', description: 'Talla camisa', required: false })
    talla_camisa?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ example: '36', description: 'Talla pantalón', required: false })
    talla_pantalon?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ example: '42', description: 'Talla botas', required: false })
    talla_botas?: string;
}
