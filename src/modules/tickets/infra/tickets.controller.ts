
import { Controller, Get, Post, Put, Body, Param, Query, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TicketFacade } from '../application/ticket.facade';
import { JwtAuthGuard } from '../../auth/infra/jwt-auth.guard';
import { CreateTicketDto, CreateRespuestaDto, ReasignarTicketDto } from '../application/dto/create-ticket.dto';
import { UpdateTicketDto , reponderTicketDto} from '../application/dto/update-ticket.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';

@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketController {
    constructor(private readonly facade: TicketFacade) { }

    @Post()
    create(@Body() dto: CreateTicketDto) { return this.facade.create(dto);}

    @Get('activos')
    getActivos(@Query('page') page?: string, @Query('limit') limit?: string) {
        const p = page ? parseInt(page, 10) : 1;
        const l = limit ? parseInt(limit, 10) : 50;
        return this.facade.getActivos(p, l);
    }

    @Get('finalizados')
    getFinalizados(@Query('page') page?: string, @Query('limit') limit?: string) {
        const p = page ? parseInt(page, 10) : 1;
        const l = limit ? parseInt(limit, 10) : 50;
        return this.facade.getFinalizados(p, l);
    }

    @Get('mis-tickets/:userId')
    getByUsuario(@Param('userId') userId: string) { return this.facade.getByUsuario(+userId); }

    @Get(':id')
    getTicket(@Param('id') id: string) { return this.facade.getTicket(+id); }

    @Put(':id/reasignar')
    reasignar(@Param('id') id: string, @Body() dto: ReasignarTicketDto) { return this.facade.reasignar(+id, dto); }

    @Put(':id/responder')
    addRespuesta(@Param('id') id: string, @Body() dto: reponderTicketDto) { return this.facade.addRespuesta(+id, dto); }
}
