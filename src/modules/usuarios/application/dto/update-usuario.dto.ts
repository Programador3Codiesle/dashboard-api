import { IsEmail, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ example: 1, description: 'ID del usuario', required: false })
  id?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '12345678',
    description: 'NIT del usuario',
    required: false,
  })
  nit?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Nombre del usuario',
    description: 'Nombre del usuario',
    required: false,
  })
  nombre?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({
    example: 21,
    description: 'ID del perfil del usuario',
    required: false,
  })
  perfil?: number;
}
