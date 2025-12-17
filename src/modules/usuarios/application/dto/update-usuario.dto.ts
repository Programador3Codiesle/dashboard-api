import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUsuarioDto {
  @ApiProperty({ example: '1', description: 'ID del usuario' })
  id: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '12345678', description: 'NIT del usuario' })
  nit?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Nombre del usuario', description: 'Nombre del usuario' })
  nombre?: string;

  @IsOptional()
  @ApiProperty({ example: 21, description: 'ID del perfil del usuario' })
  perfil?: number | string; // Puede venir como número o string

}

