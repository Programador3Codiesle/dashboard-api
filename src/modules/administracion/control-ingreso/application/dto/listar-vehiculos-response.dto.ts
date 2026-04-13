import { ApiProperty } from '@nestjs/swagger';

export class ListarVehiculosResponseDto {
  @ApiProperty({ example: 1, description: 'ID del registro' })
  id: number;

  @ApiProperty({
    example: '2024-01-15',
    description: 'Fecha de salida en formato YYYY-MM-DD',
  })
  fecha_salida: string;

  @ApiProperty({
    example: '02:30 PM',
    description: 'Hora de salida en formato 12 horas',
  })
  hora_salida: string;

  @ApiProperty({ example: 50000, description: 'Kilometraje de salida' })
  km_salida: number;

  @ApiProperty({ example: 'ABC123', description: 'Placa del vehículo' })
  placa: string;

  @ApiProperty({ example: 'Automóvil', description: 'Tipo de vehículo' })
  tipo_vehiculo: string;

  @ApiProperty({
    example: 'Chevrolet Onix',
    description: 'Modelo o marca del vehículo',
  })
  modelo: string;

  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre del conductor' })
  conductor: string;

  @ApiProperty({
    example: 'María García',
    description: 'Pasajeros',
    required: false,
    nullable: true,
  })
  pasajeros?: string | null;

  @ApiProperty({
    example: 'Carlos López',
    description: 'Persona que autorizó',
    required: false,
    nullable: true,
  })
  persona_autorizo?: string | null;

  @ApiProperty({
    example: '2024-01-15',
    description: 'Fecha de llegada en formato YYYY-MM-DD',
    required: false,
    nullable: true,
  })
  fecha_llegada?: string | null;

  @ApiProperty({
    example: '05:45 PM',
    description: 'Hora de llegada en formato 12 horas',
    required: false,
    nullable: true,
  })
  hora_llegada?: string | null;

  @ApiProperty({
    example: 50150,
    description: 'Kilometraje de llegada',
    required: false,
    nullable: true,
  })
  km_llegada?: number | null;

  @ApiProperty({
    example: 'Sin observaciones',
    description: 'Observaciones',
    required: false,
    nullable: true,
  })
  observacion?: string | null;

  @ApiProperty({
    example: 'XYZ789',
    description: 'Placa del vehículo remolcado',
    required: false,
    nullable: true,
  })
  placa_vh_remolcado?: string | null;

  @ApiProperty({
    example: 'Taller Principal',
    description: 'Taller asignado',
    required: false,
    nullable: true,
  })
  taller?: string | null;

  @ApiProperty({
    example: 'CODIESEL',
    description: 'Nombre de la empresa',
    required: false,
    nullable: true,
  })
  empresa_nombre?: string | null;
}
