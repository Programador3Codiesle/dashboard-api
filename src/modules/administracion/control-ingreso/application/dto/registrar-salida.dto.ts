import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrarSalidaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(6)
  @ApiProperty({ example: 'ABC123', description: 'Placa del vehículo' })
  placa: string;

  @IsNumber()
  @ApiProperty({ example: 50000, description: 'Kilometraje de salida' })
  km_salida: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Niñera', description: 'Tipo de vehículo' })
  tipo_vehiculo: string;

  @IsNumber()
  @ApiProperty({
    example: -1,
    description: 'Id de vh_familias o -1 para otra marca',
  })
  modelo: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Gasolina', description: 'Taller destino' })
  taller: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre de quien conduce',
  })
  conductor: string;

  @IsString()
  @IsNotEmpty()
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

  @ValidateIf(
    (o: RegistrarSalidaDto) => o.tipo_vehiculo === 'Vehículo Remolcado',
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(6)
  @ApiProperty({
    example: 'GRU123',
    description: 'Placa de la grúa (solo Vehículo Remolcado)',
    required: false,
  })
  placa_grua?: string;

  @ValidateIf((o: RegistrarSalidaDto) => o.modelo === -1)
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Marca Externa',
    description: 'Marca cuando modelo es -1 (Otra Marca)',
    required: false,
  })
  otra_marca?: string;
}
