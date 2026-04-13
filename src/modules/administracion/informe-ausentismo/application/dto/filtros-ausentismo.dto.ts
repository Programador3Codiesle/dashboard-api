import { IsOptional, IsDateString, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FiltrosAusentismoDto {
  @IsOptional()
  @IsDateString()
  @ApiProperty({
    example: '2025-01-01',
    description: 'Fecha desde',
    required: false,
  })
  fecha_desde?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    example: '2025-01-31',
    description: 'Fecha hasta',
    required: false,
  })
  fecha_hasta?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Bucaramanga', description: 'Sede', required: false })
  sede?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Administracion',
    description: 'Área',
    required: false,
  })
  area?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Buscar por nombre del empleado/colaborador',
    required: false,
  })
  empleado?: string;

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
      'Si es 1, solo devuelve ausentismos pendientes de autorización',
    required: false,
  })
  solo_pendientes?: number;
}
