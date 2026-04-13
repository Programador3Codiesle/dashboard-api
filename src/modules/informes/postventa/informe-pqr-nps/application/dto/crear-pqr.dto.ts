import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CrearPqrDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  fuente!: string;

  @IsString()
  @IsNotEmpty()
  sede!: string;

  @IsString()
  @IsNotEmpty()
  fecha!: string;

  @IsString()
  @IsOptional()
  placa!: string;

  @IsString()
  @IsNotEmpty()
  cliente!: string;

  @IsString()
  @IsOptional()
  modeloVh!: string;

  @IsString()
  @IsOptional()
  orden!: string;

  @IsString()
  @IsNotEmpty()
  mail!: string;

  @IsString()
  @IsNotEmpty()
  telefono!: string;

  @IsString()
  @IsNotEmpty()
  tecnico!: string;

  @IsString()
  @IsNotEmpty()
  comentarios!: string;
}
