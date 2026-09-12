import { Type } from 'class-transformer';
import { IsIn, IsInt, Max, Min } from 'class-validator';

export class RankingTrimestralQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  ano!: number;

  @Type(() => Number)
  @IsIn([1, 2, 3, 4])
  trimestre!: 1 | 2 | 3 | 4;
}
