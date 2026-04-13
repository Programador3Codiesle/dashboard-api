import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrarLlegadaDto {
  @IsNumber()
  @ApiProperty({ example: 50100, description: 'Kilometraje de llegada' })
  km_llegada: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Vehiculo en buen estado',
    description: 'Observaciones',
    required: false,
  })
  observacion?: string;
}
