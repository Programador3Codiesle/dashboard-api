import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class TipoNumeroQueryDto {
  @IsString()
  @IsNotEmpty()
  tipo!: string;

  @Type(() => Number)
  @IsInt()
  numero!: number;
}

export class AnoMesQueryDto {
  @Type(() => Number)
  @IsInt()
  ano!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  mes!: number;
}
