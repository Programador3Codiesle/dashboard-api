import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAjusteValoresDto {
    @IsString()
    @ApiProperty({ example: 'FA', description: 'Tipo de documento' })
    tipo: string;

    @IsNumber()
    @ApiProperty({ example: 12345, description: 'Número de documento' })
    numero: number;
}
