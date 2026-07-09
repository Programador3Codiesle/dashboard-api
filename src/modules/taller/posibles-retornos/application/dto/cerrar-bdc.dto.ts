import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class CerrarBdcDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idPosibleBdc!: number;
}
