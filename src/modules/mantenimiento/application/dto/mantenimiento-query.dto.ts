import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class ListarEquiposQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  filter?: string;

  @IsOptional()
  @IsString()
  bodega?: string;

  @IsOptional()
  @IsString()
  area?: string;
}

export class InformeQueryDto {
  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  bodega?: string;
}

export class NombresFamiliaDto {
  @IsString()
  @IsNotEmpty()
  codigo!: string;
}

export class OrdenPreventivoDto {
  @IsString()
  @IsNotEmpty()
  codigoEquipoMp!: string;

  @IsString()
  @IsNotEmpty()
  f_requerida!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  tiempo_estimado!: number;

  @IsString()
  @IsNotEmpty()
  descripcionMp!: string;
}

export class IniciarSolicitudDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tiempo_estimado?: number;
}

export class MensajeDto {
  @IsString()
  @IsNotEmpty()
  mensaje!: string;
}

export class UpdateEquipoSolicitudDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_equipo!: number;
}

export class IniciarOrdenDto {
  @IsString()
  @IsNotEmpty()
  asignado!: string;
}

export class FinalizarOrdenDto {
  @IsString()
  @IsNotEmpty()
  observaciones!: string;

  @IsString()
  @IsNotEmpty()
  piezas!: string;

  @IsOptional()
  @IsBoolean()
  reasignar?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['mensual', 'trimestral', 'semestral', 'anual'])
  periodo?: string;
}

export class UpdateFechaOrdenDto {
  @IsString()
  @IsNotEmpty()
  date!: string;

  @IsString()
  @IsNotEmpty()
  date_old!: string;
}

export class RetiroPublicoQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id!: number;

  @IsString()
  @IsNotEmpty()
  nit_user_resp!: string;
}
