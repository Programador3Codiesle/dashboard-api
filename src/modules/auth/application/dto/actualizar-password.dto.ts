import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActualizarPasswordForzadoDto {
  @IsString()
  @ApiProperty()
  userId: string;

  @IsString()
  @ApiProperty()
  changeToken: string;

  @IsString()
  @MinLength(8)
  @ApiProperty()
  pass1: string;

  @IsString()
  @MinLength(8)
  @ApiProperty()
  pass2: string;
}
