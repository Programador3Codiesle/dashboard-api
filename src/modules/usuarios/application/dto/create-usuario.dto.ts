import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @IsString()
  @ApiProperty({ example: '1234567890', description: 'NIT del usuario' })
  nit: string;

  @IsString()
  @ApiProperty({ example: '21', description: 'ID del perfil del usuario' })
  perfil: string;
}
