import { IsNumber, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsNumber()
    nit_usuario: number;

    @IsString()
    @MinLength(6)
    password: string;
}