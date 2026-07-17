import { IsNotEmpty, IsString } from 'class-validator';

export class CrearVehiculoDto {
  @IsString()
  @IsNotEmpty()
  placa!: string;

  @IsNotEmpty()
  orden!: string | number;
}
