import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ValidarTokenQueryDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class CargarFirmaDto {
  @IsInt()
  opcion: number;

  @IsString()
  @IsNotEmpty()
  llave: string;

  @IsString()
  @IsOptional()
  token?: string;

  @IsString()
  @IsOptional()
  dataForm?: string;

  @IsString()
  @IsOptional()
  img_firma_user?: string;
}

export class ImprimirMpviClienteQueryDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
