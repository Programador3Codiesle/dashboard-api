import { IsIn, IsInt } from 'class-validator';

export class ConsultarObsoletosDto {
  @IsIn([1, 2, 3, 4])
  opcion!: 1 | 2 | 3 | 4;

  @IsIn([1, 2])
  categoria!: 1 | 2;

  @IsInt()
  rango!: number;
}
