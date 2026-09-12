import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CrearOrdenGeneralDto {
  @IsString()
  @IsNotEmpty()
  serial!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
