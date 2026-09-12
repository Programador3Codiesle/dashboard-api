import { IsNumber, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecuperarCodigoDto {
  @IsNumber()
  @ApiProperty({ example: 1234567890, description: 'NIT / cédula' })
  nit: number;
}

export class ValidarCodigoRecuperacionDto {
  @IsNumber()
  @ApiProperty({ example: 1234567890 })
  nit: number;

  @IsString()
  @Length(1, 10)
  @ApiProperty({ example: 'A1B2' })
  codigo: string;
}
