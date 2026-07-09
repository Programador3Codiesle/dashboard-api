import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ObtenerItemsDto {
  @IsString()
  @IsNotEmpty()
  placa: string;
}

export class ObtenerDatosDto {
  @IsInt()
  bod: number;

  @IsString()
  @IsNotEmpty()
  placa: string;

  @IsString()
  @IsOptional()
  urgentes?: string;

  @IsString()
  @IsOptional()
  recomendados?: string;

  @IsString()
  @IsOptional()
  cobrables?: string;
}

export class ObtenerStockDto {
  @IsString()
  @IsNotEmpty()
  codRepuesto: string;
}

export class GuardarDatosDto {
  @IsInt()
  bod: number;

  @IsString()
  @IsNotEmpty()
  placa: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  celular: string;

  @IsString()
  @IsNotEmpty()
  correo: string;

  @IsString()
  @IsOptional()
  num_orden?: string;

  @IsString()
  @IsNotEmpty()
  diasProxContacto: string;

  @IsString()
  @IsOptional()
  nota?: string;

  @IsString()
  @IsOptional()
  urgentes?: string;

  @IsString()
  @IsOptional()
  recomendados?: string;

  @IsString()
  @IsOptional()
  cobrables?: string;

  @IsString()
  @IsNotEmpty()
  disponibilidad: string;

  @IsString()
  @IsNotEmpty()
  autorizados: string;
}
