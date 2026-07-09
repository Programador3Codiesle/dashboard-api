import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, Max, Min } from 'class-validator';

export class ActualizarPresupuestoDto {
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  anio!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  mes!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  sedeId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  tipoId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  tipoVh!: number;

  @IsIn(['presupuesto', 'saldo'])
  campo!: 'presupuesto' | 'saldo';

  @Type(() => Number)
  @IsNumber()
  valor!: number;
}
