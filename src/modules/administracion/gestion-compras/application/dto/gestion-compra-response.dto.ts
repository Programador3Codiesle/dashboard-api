import { ApiProperty } from '@nestjs/swagger';

export class GestionCompraResponseDto {
    @ApiProperty()
    id_solicitud: string;

    @ApiProperty()
    fecha_solicitud: string;

    @ApiProperty()
    area: string;

    @ApiProperty()
    sede: string;

    @ApiProperty()
    usu_solicita: number;

    @ApiProperty()
    cargo_usu_solicita: string;

    @ApiProperty()
    gerente_autoriza: number;

    @ApiProperty()
    descri_prod: string;

    @ApiProperty({ required: false })
    caracteristicas?: string;

    @ApiProperty({ required: false })
    proveedor?: string;

    @ApiProperty({ required: false })
    area_cargar?: string;

    @ApiProperty()
    urgencia: number;

    @ApiProperty()
    fecha_tentativa: string;

    @ApiProperty()
    estado: number;

    @ApiProperty({ required: false })
    fecha_autorizacion?: string | null;

    @ApiProperty({ required: false })
    cotizacion_file?: string | null;

    @ApiProperty()
    estado_autorizacion: number;

    @ApiProperty({ required: false })
    con_factura?: string | null;

    @ApiProperty({ required: false })
    usuario_reg?: string;

    @ApiProperty({ required: false })
    nit_usu_reg?: number;

    @ApiProperty({ required: false })
    gerente?: string;

    @ApiProperty({ required: false })
    nit_gerente?: number;

    @ApiProperty({ required: false })
    dias_gest?: number;
}

export class ListarComprasResponseDto {
    @ApiProperty({ type: [GestionCompraResponseDto] })
    items: GestionCompraResponseDto[];

    @ApiProperty()
    total: number;

    @ApiProperty()
    page: number;

    @ApiProperty()
    limit: number;
}
