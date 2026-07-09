import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class ListarSolicitudesEvDto {
  @IsOptional()
  @IsInt()
  idSolicitud?: number;

  @IsOptional()
  @IsInt()
  nOrden?: number;

  @IsOptional()
  @IsString()
  placa?: string;

  @IsOptional()
  @IsInt()
  bodega?: number;

  @IsOptional()
  @IsString()
  fechaRegistro?: string;
}

export class DetalleSolicitudEvDto {
  @IsInt()
  idSolicitud!: number;

  @IsIn([0, 1])
  modo!: 0 | 1;
}

export class LineaAuthDto {
  @IsInt()
  idDetalle!: number;

  @IsIn([1, 2])
  estadoAuth!: 1 | 2;
}

export class AutorizarSolicitudEvDto {
  @IsInt()
  idSolicitud!: number;

  @IsString()
  @IsNotEmpty()
  obsAuth!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineaAuthDto)
  lineas!: LineaAuthDto[];
}

export class RegistrarEvDto {
  @IsInt()
  idSolicitud!: number;

  @IsInt()
  idDetalle!: number;

  @IsString()
  @IsNotEmpty()
  tipoEv!: string;

  @IsInt()
  numeroEv!: number;

  @IsInt()
  numeroOrdenEv!: number;

  @IsString()
  @IsNotEmpty()
  obs!: string;
}

export class RegistrarSvDto {
  @IsInt()
  idSolicitud!: number;

  @IsInt()
  idDetalle!: number;

  @IsString()
  @IsNotEmpty()
  tipoSv!: string;

  @IsInt()
  numeroSv!: number;

  @IsInt()
  numeroOrdenSv!: number;

  @IsString()
  @IsNotEmpty()
  obs!: string;
}

export class MarcarEntregadoDto {
  @IsInt()
  idDetalle!: number;

  @IsInt()
  idSolicitud!: number;
}
