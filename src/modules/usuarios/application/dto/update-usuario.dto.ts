import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  telefono?: string;

  @IsOptional()
  @IsString()
  rol?: string;
}
