import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnviarAutorizacionCompraDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Comentarios adicionales sobre la autorización',
    description: 'Comentarios adicionales',
  })
  comentarios: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    example: [
      '/uploads/compras/cotizacion1.pdf',
      '/uploads/compras/cotizacion2.pdf',
    ],
    description: 'URLs de los archivos de cotización subidos',
    required: false,
  })
  archivos?: string[];
}
