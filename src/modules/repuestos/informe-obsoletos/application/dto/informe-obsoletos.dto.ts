import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ConsultarObsoletosDto {
  @IsIn([1, 2, 3, 4])
  opcion!: 1 | 2 | 3 | 4;

  @IsIn([1, 2])
  categoria!: 1 | 2;

  @IsInt()
  rango!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limite?: number;
}
