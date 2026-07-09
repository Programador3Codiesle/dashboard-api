import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class SolucionOrdenDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  numero!: number;
}
