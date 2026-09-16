import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrarLlegadaDto {
  @IsNumber()
  @Min(1)
  @ApiProperty({ example: 50100, description: 'Kilometraje de llegada (> 0)' })
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
