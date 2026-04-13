import { IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAjusteValoresDto {
  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 1000,
    description: 'Retención en la fuente',
    required: false,
  })
  retencion?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 500, description: 'Reteiva', required: false })
  retencion_iva?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 300, description: 'Reteica', required: false })
  retencion_ica?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 2000, description: 'IVA', required: false })
  iva?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 2000, description: 'IVA', required: false })
  Retencion_estampilla2?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 100,
    description: 'Avisos y tableros',
    required: false,
  })
  Retencion_estampilla1?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 500,
    description: 'Sobretasa bomberil',
    required: false,
  })
  valor_aplicado?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 5000,
    description: 'Valor aplicado',
    required: false,
  })
  valor_total?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 1, description: 'Forma de pago', required: false })
  forma_pago?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 10000, description: 'Valor', required: false })
  valor?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 2, description: 'Forma de pago 2', required: false })
  forma_pago2?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 5000, description: 'Valor 2', required: false })
  valor2?: number;
}
