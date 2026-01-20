import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGestionCompraDto {
    @IsString()
    @ApiProperty({ example: 'Sistemas', description: 'Área que solicita la compra' })
    area: string;

    @IsString()
    @ApiProperty({ example: 'Bucaramanga', description: 'Sede' })
    sede: string;

    @IsString()
    @ApiProperty({ example: 'Juan Pérez', description: 'Nombre de la persona que realiza la solicitud' })
    nombre_solicitante: string;

    @IsString()
    @ApiProperty({ example: 'Analista', description: 'Cargo de la persona que solicita' })
    cargo_usu_solicita: string;

    @IsNumber()
    @ApiProperty({ example: 123, description: 'NIT del gerente que autoriza' })
    gerente_autoriza: number;

    @IsOptional()
    @IsString()
    @ApiProperty({ example: 'Proveedor ABC', description: 'Proveedores o contratistas sugeridos', required: false })
    proveedor?: string;

    @IsNumber()
    @ApiProperty({ example: 1, description: 'Nivel de urgencia (1-3, siendo 3 más urgente)' })
    urgencia: number;

    @IsString()
    @ApiProperty({ example: 'Área 1: 50%, Área 2: 50%', description: 'Área y % a la que se debe cargar la compra' })
    area_cargar: string;

    @IsString()
    @ApiProperty({ example: 'Descripción del producto o servicio', description: 'Descripción de producto o servicio' })
    descri_prod: string;

    @IsDateString()
    @ApiProperty({ example: '2025-01-15', description: 'Fecha tentativa' })
    fecha_tentativa: string;
}
