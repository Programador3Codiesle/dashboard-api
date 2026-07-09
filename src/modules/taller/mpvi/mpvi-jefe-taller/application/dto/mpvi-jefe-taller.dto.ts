import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ObtenerDatosServicioDto {
  @IsInt()
  op: number;

  @IsInt()
  idCotizacion: number;
}

export class GuardarDatosServicioDto {
  @IsInt()
  op: number;

  @IsInt()
  opGuardar: number;

  @IsInt()
  idCotizacion: number;

  @IsString()
  @IsNotEmpty()
  correo: string;

  @IsString()
  @IsNotEmpty()
  diasProxContacto: string;

  @IsString()
  @IsOptional()
  nota?: string;

  @IsString()
  @IsNotEmpty()
  totalAutorizado: string;

  @IsString()
  @IsNotEmpty()
  operaciones: string;

  @IsString()
  @IsNotEmpty()
  repuestos: string;

  @IsString()
  @IsNotEmpty()
  disponibilidad: string;

  @IsString()
  @IsNotEmpty()
  autorizaciones: string;

  @IsString()
  @IsNotEmpty()
  subsistemas: string;

  @IsString()
  @IsNotEmpty()
  valoresAuto: string;

  @IsString()
  @IsNotEmpty()
  valoresDisp: string;
}
