import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrarSalidaDto {
  @IsString()
  @ApiProperty({ example: 'ABC123', description: 'Placa del vehículo' })
  placa: string;

  @IsNumber()
  @ApiProperty({ example: 50000, description: 'Kilometraje de salida' })
  km_salida: number;

  @IsString()
  @ApiProperty({ example: 'Camioneta', description: 'Tipo de vehículo' })
  tipo_vehiculo: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 2020,
    description: 'Modelo del vehículo',
    required: false,
  })
  modelo?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Taller 1',
    description: 'Taller destino',
    required: false,
  })
  taller?: string;

  @IsString()
  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre de quien conduce',
  })
  conductor: string;

  @IsString()
  @ApiProperty({ example: 'María García', description: 'Quien autorizó' })
  persona_autorizo: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Carlos, Ana, Luis',
    description: 'Nombres de empleados que van en el vehículo',
    required: false,
  })
  pasajeros?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 1, description: 'ID de la empresa', required: false })
  id_empresa?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Marca Externa',
    description: 'Otra marca del vehículo',
    required: false,
  })
  otra_marca?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'GRU123',
    description: 'Placa de la grúa',
    required: false,
  })
  placa_vh_remolcado?: string;
}
