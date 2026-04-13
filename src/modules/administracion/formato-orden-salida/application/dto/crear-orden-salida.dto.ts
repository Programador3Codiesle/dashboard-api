import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CrearOrdenSalidaDto {
  @IsDateString()
  fecha_salida: string;

  @IsString()
  @IsNotEmpty()
  area: string;

  @IsString()
  @IsNotEmpty()
  sede: string;

  @IsNumber()
  jefe: number;

  @IsNumber()
  tipoSalida: number;

  @IsNumber()
  id_empresa: number;

  @IsString()
  @IsNotEmpty()
  quienSale: string;

  @IsOptional()
  @IsString()
  placa?: string;

  @IsOptional()
  @IsString()
  conductor?: string;

  @IsString()
  @IsNotEmpty()
  explicacion: string;
}
