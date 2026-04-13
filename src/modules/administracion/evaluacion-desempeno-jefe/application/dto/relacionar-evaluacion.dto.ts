import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RelacionarEvaluacionDto {
  @IsNumber()
  @ApiProperty({ example: 1095944273, description: 'NIT del usuario/empleado' })
  nit_usuario: number;

  @IsNumber()
  @ApiProperty({ example: 63369607, description: 'NIT del jefe' })
  nit_jefe: number;
}
