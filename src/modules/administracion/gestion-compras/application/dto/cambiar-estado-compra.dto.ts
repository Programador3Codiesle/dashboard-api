import { IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CambiarEstadoCompraDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  @ApiProperty({
    example: 2,
    description:
      'Estado de la compra: 1=Sin revisar, 2=En proceso, 3=En tránsito, 4=Despachada, 5=Negada',
  })
  estado: number;
}
