import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ObtenerPanelQueryDto {
  @IsOptional()
  @IsString()
  bodega?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_empresa?: number;
}

export class AgregarEventoDto {
  @Type(() => Number)
  @IsInt()
  ot!: number;

  @IsString()
  @IsNotEmpty()
  estado!: string;

  @IsString()
  @IsNotEmpty()
  notas!: string;

  @IsOptional()
  @IsString()
  fecPromesaEntrega?: string;
}

export class FacturaMesActualDto {
  @Type(() => Number)
  @IsInt()
  numeroOrden!: number;

  @Type(() => Number)
  @IsIn([0, 1])
  estado!: number;
}

export class ValoresEstimadosDto {
  @Type(() => Number)
  @IsInt()
  inputNumeroOr!: number;

  @Type(() => Number)
  @IsInt()
  inputMO!: number;

  @Type(() => Number)
  @IsInt()
  inputRpto!: number;

  @Type(() => Number)
  @IsInt()
  inputToT!: number;
}
