import { IsEmail, IsOptional, IsString, IsDate, IsNumber, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class CreateTicketDto {
    @IsString()
    @ApiProperty({ example: 'Tipo de soporte', description: 'Tipo de soporte' })
    tipo_soporte: string;
    @IsOptional()
    @IsString()
    @ApiProperty({ example: 'Anydesk', description: 'Anydesk' })
    anydesk?: string;
    @IsString()
    @ApiProperty({ example: 'Descripcion del ticket', description: 'Descripcion del ticket' })
    descripcion: string;
    @IsOptional()
    @IsString()
    @ApiProperty({ example: 'Archivo url', description: 'Archivo url' })
    archivo_url?: string;
    @IsArray()
    @IsNumber({ allowNaN: false, allowInfinity: false }, { each: true })
    @ApiProperty({ example: 'Empresa', description: 'Empresa' })
    empresa: number[];
    @IsString()
    @ApiProperty({ example: 'Prioridad', description: 'Prioridad' })
    prioridad: string;
    @IsNumber()
    @ApiProperty({ example: 'Usuario ID', description: 'ID del usuario que crea el ticket' })
    usuario_id: number;
}

export class CreateRespuestaDto {
    @IsNumber()
    @ApiProperty({ example: 'Ticket id', description: 'Ticket id' })
    ticket_id: number;
    @IsNumber()
    @ApiProperty({ example: 'Usuario ID', description: 'ID del usuario que responde' })
    usuario_id: number;
    @IsString()
    @ApiProperty({ example: 'Mensaje', description: 'Mensaje' })
    mensaje: string;
    @IsString()
    @ApiProperty({ example: 'Archivo url', description: 'Archivo url' })
    archivo_url?: string;
}

export class ReasignarTicketDto {
    @IsNumber()
    @ApiProperty({ example: 'Encargado ID', description: 'ID del encargado que reasigna el ticket' })
    encargado_id: number;
    @IsString()
    @ApiProperty({ example: 'Prioridad', description: 'Prioridad' })
    prioridad: string;
}

