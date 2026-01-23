import { IsEmail, IsString, MinLength, IsOptional, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @IsNumberString()
    @ApiProperty({ example: '1234567890', description: 'NIT del usuario' })
    email: string;

    @IsString()
    @MinLength(6)
    @ApiProperty({ example: 'password123', description: 'Contraseña del usuario (mínimo 6 caracteres)' })
    password: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ example: 'Juan Pérez', description: 'Nombre del usuario', required: false })
    name?: string;
}