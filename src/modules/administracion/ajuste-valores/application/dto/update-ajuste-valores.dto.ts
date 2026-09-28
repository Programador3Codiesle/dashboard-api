import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LineaFormaPagoDto {
  @IsNumber()
  @ApiProperty({ description: 'id de documentos_che' })
  id: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    description:
      'Forma de pago (0 a 7). Nulo deja la fila vacía, como la pantalla anterior',
    nullable: true,
  })
  forma_pago!: number | null;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    description: 'Valor de la forma de pago. Nulo deja la fila vacía',
    nullable: true,
  })
  valor!: number | null;
}

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
  @ApiProperty({
    example: 2000,
    description: 'Avisos y tableros',
    required: false,
  })
  Retencion_estampilla2?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 100,
    description: 'Sobretasa bomberil',
    required: false,
  })
  Retencion_estampilla1?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 500,
    description: 'Valor aplicado',
    required: false,
  })
  valor_aplicado?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 5000,
    description: 'Valor total',
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

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    description: 'Valor de documentos_cruce.valor',
    required: false,
  })
  valor_aplicado2?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineaFormaPagoDto)
  @ApiProperty({ type: [LineaFormaPagoDto], required: false })
  lineas?: LineaFormaPagoDto[];
}
