import { IsBoolean, IsInt, IsNumber, Min } from 'class-validator';

export class ToggleDistribucionDto {
  @IsNumber()
  agente!: number;

  @IsInt()
  bodega!: number;

  @IsBoolean()
  activo!: boolean;
}

export class UpdateDistribucionDto {
  @IsNumber()
  agente!: number;

  @IsInt()
  bodega!: number;

  @IsNumber()
  @Min(0)
  distribucion!: number;
}
