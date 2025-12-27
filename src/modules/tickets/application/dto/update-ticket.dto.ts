
import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './create-ticket.dto';

import { IsEmail, IsOptional, IsString, IsDate, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
    @IsString()
    @ApiProperty({ example: 'Estado del ticket', description: 'Estado del ticket' })
    estado?: string;
    @IsNumber()
    @ApiProperty({ example: 'Encargado ID', description: 'ID del encargado que reasigna el ticket' })
    encargado_id?: number;
}


export class reponderTicketDto {
    @IsString()
    @ApiProperty({ example: 'Respuesta del ticket', description: 'Respuesta del ticket' })
    respuesta: string;
    @IsString()
    @ApiProperty({ example: 'Estado del ticket', description: 'Estado del ticket' })
    estado: string;
    @IsDate()
    @IsOptional()
    @ApiProperty({ example: 'Fecha de respuesta del ticket', description: 'Fecha de respuesta del ticket', required: false })
    fecha_respuesta?: Date;

    @IsString()
    @ApiProperty({ example: 'Nombre del usuario', description: 'Nombre del usuario' })
    nombre: string;

}

