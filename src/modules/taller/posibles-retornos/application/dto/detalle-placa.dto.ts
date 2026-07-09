import { IsNotEmpty, IsString } from 'class-validator';

export class DetallePlacaDto {
  @IsString()
  @IsNotEmpty()
  placa!: string;
}
