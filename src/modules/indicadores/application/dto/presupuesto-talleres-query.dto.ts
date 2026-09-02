import { IsNotEmpty, IsString } from 'class-validator';

export class PresupuestoTalleresQueryDto {
  @IsString()
  @IsNotEmpty()
  sede!: string;
}
