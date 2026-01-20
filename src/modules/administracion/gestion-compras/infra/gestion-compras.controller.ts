import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { GestionCompraFacade } from '../application/gestion-compra.facade';
import { CreateGestionCompraDto } from '../application/dto/create-gestion-compra.dto';
import { FiltrosComprasDto } from '../application/dto/filtros-compras.dto';

@Controller('administracion/gestion-compras')
export class GestionComprasController {
    constructor(private readonly facade: GestionCompraFacade) {}

    @Post()
    crearSolicitud(@Body() dto: CreateGestionCompraDto) {
        // TODO: Obtener userId del token JWT
        return this.facade.crearSolicitud(dto, 1);
    }

    @Get()
    listar(@Query() filtros: FiltrosComprasDto) {
        return this.facade.listarCompras(filtros);
    }

    @Get('exportar')
    exportar(@Query() filtros: FiltrosComprasDto) {
        // TODO: Implementar exportación a Excel
        return this.facade.listarCompras(filtros);
    }
}
