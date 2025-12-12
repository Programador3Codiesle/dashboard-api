import { IsEmail, IsString, MinLength, IsOptional, IsNumberString } from 'class-validator';

export class RegisterDto {
    @IsNumberString()
    email: string;


    @IsString()
    @MinLength(6)
    password: string;


    @IsOptional()
    @IsString()
    name?: string;
}