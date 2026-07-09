import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GetGraficoDto {
  @Type(() => Number)
  @IsInt()
  @Min(2023)
  year!: number;

  @IsOptional()
  @IsString()
  tecnico?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sede?: number;
}
