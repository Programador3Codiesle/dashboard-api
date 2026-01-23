import { ApiProperty } from '@nestjs/swagger';

export class RegistrarSalidaResponseDto {
    @ApiProperty({ example: true, description: 'Estado de la operación' })
    status: boolean;

    @ApiProperty({ example: 'Salida registrada correctamente', description: 'Mensaje de respuesta' })
    message: string;

    @ApiProperty({
        description: 'Datos del vehículo registrado',
        required: false,
        example: {
            id: 1,
            fecha_salida: '2026-01-09',
            hora_salida: '03:10 PM',
            km_salida: 50000,
            placa: 'ABC123',
            tipo_vehiculo: 'Camioneta',
            conductor: 'Juan Pérez',
            pasajeros: 'Carlos, Ana',
            persona_autorizo: 'María García',
            porteria: 'Vigilancia Giron',
            modelo: 2020,
            taller: 'Taller 1',
            otra_marca: null,
            placa_vh_remolcado: null,
            id_empresa: 1
        }
    })
    data?: {
        id: number;
        fecha_salida: string;
        hora_salida: string;
        km_salida: number;
        placa: string;
        tipo_vehiculo: string;
        conductor: string;
        pasajeros?: string | null;
        persona_autorizo?: string | null;
        porteria: string;
        modelo?: number | null;
        taller?: string | null;
        otra_marca?: string | null;
        placa_vh_remolcado?: string | null;
        id_empresa?: number | null;
        empresa_nombre?: string | null;
    };
}

