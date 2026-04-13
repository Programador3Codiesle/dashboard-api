import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CrearVerbalizacionDto {
  @IsInt()
  idPqrNps!: number;

  @IsString()
  @IsNotEmpty()
  contacto!: string;

  @IsString()
  @IsNotEmpty()
  verbalizacion!: string;
}
