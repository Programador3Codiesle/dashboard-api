import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CrearTotDto {
  @IsNotEmpty()
  orden!: string | number;

  @IsOptional()
  @IsString()
  proveedor?: string;

  @IsOptional()
  @IsString()
  contenido?: string;

  @IsOptional()
  @IsString()
  placa?: string;
}
