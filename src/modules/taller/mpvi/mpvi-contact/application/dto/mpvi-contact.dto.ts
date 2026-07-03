import { IsInt, IsOptional, IsString } from 'class-validator';

export class ObtenerCotizacionContactDto {
  @IsInt()
  @IsOptional()
  bod?: number;

  @IsString()
  @IsOptional()
  placa?: string;

  @IsInt()
  @IsOptional()
  idCotizacion?: number;
}

export class DescartarCotizacionDto {
  @IsInt()
  idCotizacion: number;
}
