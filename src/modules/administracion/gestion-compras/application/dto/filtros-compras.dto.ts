import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FiltrosComprasDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '',
    description: 'Búsqueda general',
    required: false,
  })
  buscar?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ example: 1, description: 'Página', required: false })
  pagina?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    example: 10,
    description: 'Límite por página',
    required: false,
  })
  limite?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    example: 1,
    description:
      'Estado de la compra (1=Sin revisar, 2=En proceso, 3=En tránsito, 4=Despachada, 5=Negada)',
    required: false,
  })
  estado?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    example: 1,
    description:
      'Estado de autorización (1=Sin autorizar, 2=Pendiente, 3=Autorizado, 4=No autorizado)',
    required: false,
  })
  estado_autorizacion?: number;
}
