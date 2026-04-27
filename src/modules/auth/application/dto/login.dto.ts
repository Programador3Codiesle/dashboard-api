import { IsBoolean, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsNumber()
  @ApiProperty({ example: 1234567890, description: 'NIT del usuario' })
  nit_usuario: number;

  @IsString()
  @MinLength(6)
  @ApiProperty({
    example: 'password123',
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
  })
  password: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: true,
    required: false,
    description: 'Indica si la sesión debe persistir entre reinicios del navegador',
  })
  remember?: boolean;
}
