import { Type } from 'class-transformer';
import { IsIn, IsObject, IsInt } from 'class-validator';

export class GuardarChecklistDto {
  @IsInt()
  @IsIn([0, 1, 2, 3, 4, 5, 6])
  check!: number;

  @IsObject()
  @Type(() => Object)
  data!: Record<string, unknown>;
}
