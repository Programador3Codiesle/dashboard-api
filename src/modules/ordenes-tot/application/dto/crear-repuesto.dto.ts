import { IsNotEmpty, IsString } from 'class-validator';

export class CrearRepuestoDto {
  @IsString()
  @IsNotEmpty()
  placa!: string;

  @IsNotEmpty()
  orden!: string | number;
}
