import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearMensajeCompraDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @ApiProperty({ example: 'Mensaje sobre la solicitud de compra', description: 'Mensaje a enviar' })
    mensaje: string;
}
