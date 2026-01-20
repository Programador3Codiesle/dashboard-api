import { ApiProperty } from '@nestjs/swagger';

export class ResponseAjusteValoresDto {
    @ApiProperty({ example: 1, description: 'ID del ajuste de valores', required: false })
    sw?: number;

    @ApiProperty({ example: 'FA', description: 'Tipo de documento' })
    tipo: string;

    @ApiProperty({ example: 'FA', description: 'Tipo de documento cruce' })
    tipo_cruce: string;

    @ApiProperty({ example: 'FA', description: 'Tipo de documento cruce' })
    numero_cruce: number;

    @ApiProperty({ example: 12345, description: 'Número de documento' })
    numero: number;

    @ApiProperty({ example: 1000, description: 'Retención en la fuente', required: false, nullable: true })
    retencion?: number | null;

    @ApiProperty({ example: 500, description: 'Reteiva', required: false, nullable: true })
    retencion_iva?: number | null;

    @ApiProperty({ example: 300, description: 'Reteica', required: false, nullable: true })
    retencion_ica?: number | null;

    @ApiProperty({ example: 2000, description: 'IVA', required: false, nullable: true })
    iva?: number | null;

    @ApiProperty({ example: 2000, description: 'Retención estampilla 2', required: false, nullable: true })
    Retencion_estampilla2?: number | null;

    @ApiProperty({ example: 100, description: 'Retención estampilla 1', required: false, nullable: true })
    Retencion_estampilla1?: number | null;

    @ApiProperty({ example: 500, description: 'Valor aplicado', required: false, nullable: true })
    valor_aplicado?: number | null;

    @ApiProperty({ example: 5000, description: 'Valor total', required: false, nullable: true })
    valor_total?: number | null;

    @ApiProperty({ example: 1, description: 'Forma de pago', required: false, nullable: true })
    forma_pago?: number | null;

    @ApiProperty({ example: 10000, description: 'Valor', required: false, nullable: true })
    valor?: number | null;

    @ApiProperty({ example: 2, description: 'Forma de pago 2', required: false, nullable: true })
    forma_pago2?: number | null;

    @ApiProperty({ example: 2024, description: 'Año', required: false, nullable: true })
    ano?: number | null;

    @ApiProperty({ example: 1, description: 'Mes', required: false, nullable: true })
    mes?: number | null;
}
