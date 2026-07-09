import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GuardarDefinicionDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1)
  definicion!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  selectRazon?: number;

  @IsOptional()
  @IsString()
  obs_razon?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  select_sist_inv?: number;

  @IsOptional()
  @IsString()
  obs_sist_inv?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ordenR?: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  ordenR_origen!: number;

  @IsOptional()
  @IsString()
  tecnicoR?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  selectPlan?: number;

  @IsOptional()
  @IsString()
  obs_plan?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  precio_costo_1?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  precio_costo_2?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  precio_costo_3?: number;

  @IsOptional()
  @IsString()
  obs_costos?: string;
}
