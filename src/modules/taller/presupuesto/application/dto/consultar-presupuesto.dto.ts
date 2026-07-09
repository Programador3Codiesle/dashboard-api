import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ConsultarPresupuestoDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1)
  idCategoria!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  idSede!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idTipo?: number;
}
