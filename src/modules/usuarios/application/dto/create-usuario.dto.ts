import { IsString } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  nit: string;

  @IsString()
  perfil: string;
}
