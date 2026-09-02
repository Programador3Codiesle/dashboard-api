import { IsOptional, IsString } from 'class-validator';

export class ResponderAutorizacionQueryDto {
  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @IsString()
  accion?: string;
}
