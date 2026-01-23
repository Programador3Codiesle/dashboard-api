import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignJefeDto {
  @IsNumber()
  @ApiProperty({ example: 1, description: 'ID del jefe' })
  jefeId: number;
}

export class JefesResponseDto {
    id: number;
    nombre: string;
    email?: string;
}

export class CreateJefeDto {
    @IsString()
    @ApiProperty({ example: '1234567890', description: 'NIT del jefe' })
    nit: string;
    
    @IsString()
    @ApiProperty({ example: 'jefe@example.com', description: 'Email del jefe' })
    email: string;
}
