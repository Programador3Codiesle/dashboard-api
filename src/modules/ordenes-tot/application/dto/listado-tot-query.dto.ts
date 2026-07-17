import { Type } from 'class-transformer';
import { IsIn } from 'class-validator';

export class ListadoTotQueryDto {
  @Type(() => Number)
  @IsIn([1, 2])
  estado!: 1 | 2;
}
