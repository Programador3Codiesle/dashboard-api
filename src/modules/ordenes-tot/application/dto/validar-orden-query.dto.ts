import { IsNotEmpty } from 'class-validator';

export class ValidarOrdenQueryDto {
  @IsNotEmpty()
  orden!: string | number;
}
