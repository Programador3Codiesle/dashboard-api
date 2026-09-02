import { IsNotEmpty, IsString } from 'class-validator';

export class SatisfaccionDetalleQueryDto {
  @IsString()
  @IsNotEmpty()
  ot!: string;
}
