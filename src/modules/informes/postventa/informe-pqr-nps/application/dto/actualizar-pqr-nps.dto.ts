import { IsIn, IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ActualizarPqrNpsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  fuente!: string;

  @IsInt()
  idFuente!: number;

  @IsIn([1, 2])
  postVenta!: number;

  @IsString()
  @IsNotEmpty()
  tecnico!: string;

  @IsString()
  @IsNotEmpty()
  tipificacionEncuesta!: string;

  @IsIn(['Abierto', 'Cerrado'])
  estadoCaso!: string;

  @IsString()
  comentariosFinalCaso!: string;

  @IsString()
  @IsNotEmpty()
  tipificacionCierre!: string;
}
