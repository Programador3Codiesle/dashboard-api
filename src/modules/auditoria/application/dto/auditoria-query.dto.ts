import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class OrdenesDiariasQueryDto {
  @IsString()
  @IsNotEmpty()
  fecha!: string;

  @IsString()
  @IsNotEmpty()
  bodega!: string;
}

export class EntregasQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(2022)
  ano!: number;

  @Type(() => Number)
  @IsInt()
  @IsIn([1, 2])
  tipo!: 1 | 2;
}

export class BodegaQueryDto {
  @IsString()
  @IsNotEmpty()
  bodega!: string;
}

export class BodegaOTecnicoQueryDto {
  @IsOptional()
  @IsString()
  bodega?: string;

  @IsOptional()
  @IsString()
  tecnico?: string;
}

export class NpsFabricaSedesQueryDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}$/)
  fecha!: string;
}

export class NpsFabricaTecnicosQueryDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}$/)
  fecha!: string;

  @IsOptional()
  @IsString()
  sede?: string;
}
