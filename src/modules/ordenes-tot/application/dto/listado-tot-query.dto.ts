import { Type } from 'class-transformer';
import { IsIn, IsInt, Max, Min } from 'class-validator';

export class ListadoTotQueryDto {
  @Type(() => Number)
  @IsIn([1, 2])
  estado!: 1 | 2;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;
}
